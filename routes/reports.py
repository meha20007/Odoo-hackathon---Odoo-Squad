import csv
import io
from datetime import date

from bson import ObjectId
from flask import Blueprint, Response, jsonify, request

from database.db import db
from rbac import login_required, role_required
from utils.helpers import parse_object_id

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


def _vehicle_costs(vehicle_oid: ObjectId) -> dict:
    fuel_total = 0.0
    fuel_quantity = 0.0
    for log in db.fuel_logs.find({"vehicle_id": vehicle_oid}):
        fuel_total += float(log.get("total_cost", 0))
        fuel_quantity += float(log.get("quantity", 0))

    maintenance_total = 0.0
    for record in db.maintenance.find({"vehicle_id": vehicle_oid}):
        maintenance_total += float(record.get("cost", 0))

    return {
        "fuel_cost": round(fuel_total, 2),
        "maintenance_cost": round(maintenance_total, 2),
        "operational_cost": round(fuel_total + maintenance_total, 2),
        "total_fuel_liters": round(fuel_quantity, 2),
    }


def _vehicle_distance(vehicle_oid: ObjectId) -> float:
    distance = 0.0
    for trip in db.trips.find({"vehicle_id": vehicle_oid, "status": "Completed"}):
        actual = float(trip.get("actual_distance") or 0)
        planned = float(trip.get("planned_distance") or 0)
        distance += actual if actual > 0 else planned
    return round(distance, 2)


def _vehicle_revenue(vehicle_oid: ObjectId) -> float:
    revenue = 0.0
    for trip in db.trips.find({"vehicle_id": vehicle_oid, "status": "Completed"}):
        revenue += float(trip.get("revenue", 0))
    return round(revenue, 2)


def _fleet_counts() -> dict:
    vehicles = list(db.vehicles.find())
    active_vehicles = [v for v in vehicles if v.get("status") != "Retired"]
    total_active = len(active_vehicles)

    status_counts = {
        "available": sum(1 for v in active_vehicles if v.get("status") == "Available"),
        "on_trip": sum(1 for v in active_vehicles if v.get("status") == "On Trip"),
        "in_shop": sum(1 for v in active_vehicles if v.get("status") == "In Shop"),
        "retired": sum(1 for v in vehicles if v.get("status") == "Retired"),
    }

    utilization = 0.0
    if total_active:
        utilization = round((status_counts["on_trip"] / total_active) * 100, 2)

    trips = list(db.trips.find())
    today = date.today().isoformat()
    drivers = list(db.drivers.find())

    return {
        "active_vehicles": total_active,
        "available_vehicles": status_counts["available"],
        "vehicles_in_maintenance": status_counts["in_shop"],
        "vehicles_on_trip": status_counts["on_trip"],
        "retired_vehicles": status_counts["retired"],
        "active_trips": sum(1 for t in trips if t.get("status") == "Dispatched"),
        "pending_trips": sum(1 for t in trips if t.get("status") == "Draft"),
        "drivers_on_duty": sum(1 for d in drivers if d.get("status") == "On Trip"),
        "drivers_available": sum(1 for d in drivers if d.get("status") == "Available"),
        "expired_licenses": sum(
            1 for d in drivers if str(d.get("license_expiry", "9999-12-31")) < today
        ),
        "fleet_utilization_percent": utilization,
    }


def _vehicle_report(vehicle: dict) -> dict:
    vehicle_oid = vehicle["_id"]
    costs = _vehicle_costs(vehicle_oid)
    distance = _vehicle_distance(vehicle_oid)
    revenue = _vehicle_revenue(vehicle_oid)
    acquisition_cost = float(vehicle.get("acquisition_cost", 0))

    fuel_efficiency = None
    if costs["total_fuel_liters"] > 0:
        fuel_efficiency = round(distance / costs["total_fuel_liters"], 2)

    roi = None
    if acquisition_cost > 0:
        roi = round((revenue - costs["operational_cost"]) / acquisition_cost, 4)

    return {
        "vehicle_id": str(vehicle_oid),
        "registration_number": vehicle.get("registration_number"),
        "vehicle_name": vehicle.get("vehicle_name"),
        "vehicle_type": vehicle.get("vehicle_type"),
        "status": vehicle.get("status"),
        "acquisition_cost": acquisition_cost,
        "total_distance_km": distance,
        "total_revenue": revenue,
        "fuel_cost": costs["fuel_cost"],
        "maintenance_cost": costs["maintenance_cost"],
        "operational_cost": costs["operational_cost"],
        "total_fuel_liters": costs["total_fuel_liters"],
        "fuel_efficiency_km_per_liter": fuel_efficiency,
        "vehicle_roi": roi,
    }


@reports_bp.route("/summary", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def report_summary():
    fleet = _fleet_counts()
    vehicles = list(db.vehicles.find({"status": {"$ne": "Retired"}}))

    total_operational_cost = 0.0
    total_revenue = 0.0
    for vehicle in vehicles:
        costs = _vehicle_costs(vehicle["_id"])
        total_operational_cost += costs["operational_cost"]
        total_revenue += _vehicle_revenue(vehicle["_id"])

    return jsonify(
        {
            **fleet,
            "total_operational_cost": round(total_operational_cost, 2),
            "total_revenue": round(total_revenue, 2),
        }
    )


@reports_bp.route("/fuel-efficiency", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst")
def fuel_efficiency_report():
    vehicle_id = request.args.get("vehicle_id")
    query = {"status": {"$ne": "Retired"}}
    if vehicle_id:
        oid = parse_object_id(vehicle_id)
        if not oid:
            return jsonify({"error": "Invalid vehicle_id."}), 400
        query["_id"] = oid

    reports = [_vehicle_report(vehicle) for vehicle in db.vehicles.find(query)]
    return jsonify(reports)


@reports_bp.route("/fleet-utilization", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def fleet_utilization_report():
    fleet = _fleet_counts()
    return jsonify(fleet)


@reports_bp.route("/operational-cost", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst")
def operational_cost_report():
    vehicles = list(db.vehicles.find({"status": {"$ne": "Retired"}}))
    reports = []
    grand_total = 0.0

    for vehicle in vehicles:
        report = _vehicle_report(vehicle)
        grand_total += report["operational_cost"]
        reports.append(
            {
                "vehicle_id": report["vehicle_id"],
                "registration_number": report["registration_number"],
                "vehicle_name": report["vehicle_name"],
                "fuel_cost": report["fuel_cost"],
                "maintenance_cost": report["maintenance_cost"],
                "operational_cost": report["operational_cost"],
            }
        )

    return jsonify({"total_operational_cost": round(grand_total, 2), "vehicles": reports})


@reports_bp.route("/vehicle-roi", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst")
def vehicle_roi_report():
    vehicles = list(db.vehicles.find({"status": {"$ne": "Retired"}}))
    reports = [
        {
            "vehicle_id": report["vehicle_id"],
            "registration_number": report["registration_number"],
            "vehicle_name": report["vehicle_name"],
            "acquisition_cost": report["acquisition_cost"],
            "total_revenue": report["total_revenue"],
            "operational_cost": report["operational_cost"],
            "vehicle_roi": report["vehicle_roi"],
        }
        for report in (_vehicle_report(vehicle) for vehicle in vehicles)
    ]
    return jsonify(reports)


@reports_bp.route("/vehicle/<vehicle_id>", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def vehicle_report(vehicle_id):
    oid = parse_object_id(vehicle_id)
    if not oid:
        return jsonify({"error": "Invalid vehicle_id."}), 400

    vehicle = db.vehicles.find_one({"_id": oid})
    if not vehicle:
        return jsonify({"error": "Vehicle not found."}), 404

    return jsonify(_vehicle_report(vehicle))


@reports_bp.route("/export/csv", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst")
def export_csv():
    report_type = request.args.get("type", "operational-cost")
    vehicles = list(db.vehicles.find({"status": {"$ne": "Retired"}}))
    reports = [_vehicle_report(vehicle) for vehicle in vehicles]

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "fuel-efficiency":
        writer.writerow(
            [
                "registration_number",
                "vehicle_name",
                "total_distance_km",
                "total_fuel_liters",
                "fuel_efficiency_km_per_liter",
            ]
        )
        for report in reports:
            writer.writerow(
                [
                    report["registration_number"],
                    report["vehicle_name"],
                    report["total_distance_km"],
                    report["total_fuel_liters"],
                    report["fuel_efficiency_km_per_liter"] or "",
                ]
            )
        filename = "fuel_efficiency_report.csv"
    elif report_type == "vehicle-roi":
        writer.writerow(
            [
                "registration_number",
                "vehicle_name",
                "acquisition_cost",
                "total_revenue",
                "operational_cost",
                "vehicle_roi",
            ]
        )
        for report in reports:
            writer.writerow(
                [
                    report["registration_number"],
                    report["vehicle_name"],
                    report["acquisition_cost"],
                    report["total_revenue"],
                    report["operational_cost"],
                    report["vehicle_roi"] or "",
                ]
            )
        filename = "vehicle_roi_report.csv"
    else:
        writer.writerow(
            [
                "registration_number",
                "vehicle_name",
                "fuel_cost",
                "maintenance_cost",
                "operational_cost",
            ]
        )
        for report in reports:
            writer.writerow(
                [
                    report["registration_number"],
                    report["vehicle_name"],
                    report["fuel_cost"],
                    report["maintenance_cost"],
                    report["operational_cost"],
                ]
            )
        filename = "operational_cost_report.csv"

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from database.db import db
from models.fuel import FuelEntry
from rbac import login_required, role_required
from schemas.fuel import FuelEntry as FuelResponse, FuelList
from utils.helpers import not_found, parse_object_id, serialize_dates, validation_error_response

fuel_bp = Blueprint("fuel", __name__, url_prefix="/api/fuel")


def _build_fuel_query():
    query = {}
    vehicle_id = request.args.get("vehicle_id")
    trip_id = request.args.get("trip_id")

    if vehicle_id:
        oid = parse_object_id(vehicle_id)
        if oid:
            query["vehicle_id"] = oid

    if trip_id:
        oid = parse_object_id(trip_id)
        if oid:
            query["trip_id"] = oid

    return query


def _validate_references(vehicle_id: str, trip_id: str):
    vehicle_oid = parse_object_id(vehicle_id)
    trip_oid = parse_object_id(trip_id)

    if not vehicle_oid or not trip_oid:
        return None, None, jsonify({"error": "Invalid vehicle_id or trip_id."}), 400

    vehicle = db.vehicles.find_one({"_id": vehicle_oid})
    if not vehicle:
        return None, None, not_found("Vehicle")

    trip = db.trips.find_one({"_id": trip_oid})
    if not trip:
        return None, None, not_found("Trip")

    if trip.get("vehicle_id") != vehicle_oid:
        return None, None, jsonify({"error": "Trip does not belong to the specified vehicle."}), 409

    return vehicle_oid, trip_oid, None, None


@fuel_bp.route("", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def list_fuel_logs():
    logs = list(db.fuel_logs.find(_build_fuel_query()).sort("fuel_date", -1))
    return jsonify(FuelList(logs))


@fuel_bp.route("/vehicle/<vehicle_id>", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def list_fuel_by_vehicle(vehicle_id):
    oid = parse_object_id(vehicle_id)
    if not oid:
        return not_found("Vehicle")

    if not db.vehicles.find_one({"_id": oid}):
        return not_found("Vehicle")

    logs = list(db.fuel_logs.find({"vehicle_id": oid}).sort("fuel_date", -1))
    return jsonify(FuelList(logs))


@fuel_bp.route("/<fuel_id>", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def get_fuel_log(fuel_id):
    oid = parse_object_id(fuel_id)
    if not oid:
        return not_found("Fuel log")

    log = db.fuel_logs.find_one({"_id": oid})
    if not log:
        return not_found("Fuel log")

    return jsonify(FuelResponse(log))


@fuel_bp.route("", methods=["POST"])
@login_required
@role_required("Fleet Manager", "Dispatcher", "Financial Analyst")
def create_fuel_log():
    payload = request.get_json(silent=True) or {}
    try:
        fuel = FuelEntry(**payload)
    except ValidationError as error:
        return validation_error_response(error)

    expected_total = round(fuel.quantity * fuel.cost_per_liter, 2)
    if abs(fuel.total_cost - expected_total) > 0.01:
        return jsonify(
            {
                "error": "total_cost must equal quantity × cost_per_liter.",
                "expected_total_cost": expected_total,
            }
        ), 422

    vehicle_oid, trip_oid, error_response, status_code = _validate_references(
        fuel.vehicle_id, fuel.trip_id
    )
    if error_response:
        return error_response, status_code

    document = serialize_dates(fuel.model_dump())
    document["vehicle_id"] = vehicle_oid
    document["trip_id"] = trip_oid

    result = db.fuel_logs.insert_one(document)
    created = db.fuel_logs.find_one({"_id": result.inserted_id})
    return jsonify(FuelResponse(created)), 201


@fuel_bp.route("/<fuel_id>", methods=["PUT", "PATCH"])
@login_required
@role_required("Fleet Manager", "Dispatcher", "Financial Analyst")
def update_fuel_log(fuel_id):
    oid = parse_object_id(fuel_id)
    if not oid:
        return not_found("Fuel log")

    existing = db.fuel_logs.find_one({"_id": oid})
    if not existing:
        return not_found("Fuel log")

    payload = request.get_json(silent=True) or {}
    merged = {**existing, **payload}
    merged.pop("_id", None)
    merged["vehicle_id"] = str(merged.get("vehicle_id", ""))
    merged["trip_id"] = str(merged.get("trip_id", ""))

    try:
        fuel = FuelEntry(**merged)
    except ValidationError as error:
        return validation_error_response(error)

    expected_total = round(fuel.quantity * fuel.cost_per_liter, 2)
    if abs(fuel.total_cost - expected_total) > 0.01:
        return jsonify(
            {
                "error": "total_cost must equal quantity × cost_per_liter.",
                "expected_total_cost": expected_total,
            }
        ), 422

    vehicle_oid, trip_oid, error_response, status_code = _validate_references(
        fuel.vehicle_id, fuel.trip_id
    )
    if error_response:
        return error_response, status_code

    document = serialize_dates(fuel.model_dump())
    document["vehicle_id"] = vehicle_oid
    document["trip_id"] = trip_oid

    db.fuel_logs.update_one({"_id": oid}, {"$set": document})
    updated = db.fuel_logs.find_one({"_id": oid})
    return jsonify(FuelResponse(updated))


@fuel_bp.route("/<fuel_id>", methods=["DELETE"])
@login_required
@role_required("Fleet Manager", "Financial Analyst")
def delete_fuel_log(fuel_id):
    oid = parse_object_id(fuel_id)
    if not oid:
        return not_found("Fuel log")

    if not db.fuel_logs.find_one({"_id": oid}):
        return not_found("Fuel log")

    db.fuel_logs.delete_one({"_id": oid})
    return jsonify({"message": "Fuel log deleted successfully."})

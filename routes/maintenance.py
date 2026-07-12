from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from database.db import db
from models.maintenance import MaintenanceEntry
from rbac import login_required, role_required
from schemas.maintenance import MaintenanceEntry as MaintenanceResponse, MaintenanceList
from utils.helpers import not_found, parse_object_id, serialize_dates, validation_error_response

maintenance_bp = Blueprint("maintenance", __name__, url_prefix="/api/maintenance")


def _get_vehicle(vehicle_id: str):
    oid = parse_object_id(vehicle_id)
    if not oid:
        return None
    return db.vehicles.find_one({"_id": oid})


def _set_vehicle_in_shop(vehicle_oid):
    vehicle = db.vehicles.find_one({"_id": vehicle_oid})
    if vehicle and vehicle.get("status") != "Retired":
        db.vehicles.update_one({"_id": vehicle_oid}, {"$set": {"status": "In Shop"}})


def _restore_vehicle_if_no_active_maintenance(vehicle_oid):
    vehicle = db.vehicles.find_one({"_id": vehicle_oid})
    if not vehicle or vehicle.get("status") == "Retired":
        return

    on_trip = db.trips.find_one({"vehicle_id": vehicle_oid, "status": "Dispatched"})
    if on_trip:
        return

    pending = db.maintenance.find_one({"vehicle_id": vehicle_oid, "status": "Pending"})
    if pending:
        return

    db.vehicles.update_one({"_id": vehicle_oid}, {"$set": {"status": "Available"}})


def _build_maintenance_query():
    query = {}
    vehicle_id = request.args.get("vehicle_id")
    status = request.args.get("status")

    if vehicle_id:
        oid = parse_object_id(vehicle_id)
        if oid:
            query["vehicle_id"] = oid

    if status:
        query["status"] = status

    return query


@maintenance_bp.route("", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def list_maintenance():
    records = list(db.maintenance.find(_build_maintenance_query()).sort("maintenance_date", -1))
    return jsonify(MaintenanceList(records))


@maintenance_bp.route("/<maintenance_id>", methods=["GET"])
@login_required
@role_required("Fleet Manager", "Financial Analyst", "Dispatcher")
def get_maintenance(maintenance_id):
    oid = parse_object_id(maintenance_id)
    if not oid:
        return not_found("Maintenance record")

    record = db.maintenance.find_one({"_id": oid})
    if not record:
        return not_found("Maintenance record")

    return jsonify(MaintenanceResponse(record))


@maintenance_bp.route("", methods=["POST"])
@login_required
@role_required("Fleet Manager")
def create_maintenance():
    payload = request.get_json(silent=True) or {}
    try:
        maintenance = MaintenanceEntry(**payload)
    except ValidationError as error:
        return validation_error_response(error)

    vehicle_oid = parse_object_id(maintenance.vehicle_id)
    if not vehicle_oid:
        return jsonify({"error": "Invalid vehicle_id."}), 400

    vehicle = _get_vehicle(maintenance.vehicle_id)
    if not vehicle:
        return not_found("Vehicle")

    if vehicle.get("status") == "Retired":
        return jsonify({"error": "Cannot create maintenance for a retired vehicle."}), 409

    document = serialize_dates(maintenance.model_dump())
    document["vehicle_id"] = vehicle_oid

    result = db.maintenance.insert_one(document)

    if maintenance.status == "Pending":
        _set_vehicle_in_shop(vehicle_oid)

    created = db.maintenance.find_one({"_id": result.inserted_id})
    return jsonify(MaintenanceResponse(created)), 201


@maintenance_bp.route("/<maintenance_id>", methods=["PUT", "PATCH"])
@login_required
@role_required("Fleet Manager")
def update_maintenance(maintenance_id):
    oid = parse_object_id(maintenance_id)
    if not oid:
        return not_found("Maintenance record")

    existing = db.maintenance.find_one({"_id": oid})
    if not existing:
        return not_found("Maintenance record")

    payload = request.get_json(silent=True) or {}
    merged = {**existing, **payload}
    merged.pop("_id", None)
    if "vehicle_id" in merged:
        merged["vehicle_id"] = str(merged["vehicle_id"])

    try:
        maintenance = MaintenanceEntry(**merged)
    except ValidationError as error:
        return validation_error_response(error)

    vehicle_oid = parse_object_id(maintenance.vehicle_id)
    if not vehicle_oid:
        return jsonify({"error": "Invalid vehicle_id."}), 400

    vehicle = db.vehicles.find_one({"_id": vehicle_oid})
    if not vehicle:
        return not_found("Vehicle")

    previous_status = existing.get("status")
    document = serialize_dates(maintenance.model_dump())
    document["vehicle_id"] = vehicle_oid

    db.maintenance.update_one({"_id": oid}, {"$set": document})

    if maintenance.status == "Pending" and previous_status != "Pending":
        _set_vehicle_in_shop(vehicle_oid)
    elif maintenance.status == "Completed" and previous_status != "Completed":
        _restore_vehicle_if_no_active_maintenance(vehicle_oid)

    updated = db.maintenance.find_one({"_id": oid})
    return jsonify(MaintenanceResponse(updated))


@maintenance_bp.route("/<maintenance_id>/complete", methods=["POST"])
@login_required
@role_required("Fleet Manager")
def complete_maintenance(maintenance_id):
    oid = parse_object_id(maintenance_id)
    if not oid:
        return not_found("Maintenance record")

    existing = db.maintenance.find_one({"_id": oid})
    if not existing:
        return not_found("Maintenance record")

    if existing.get("status") == "Completed":
        return jsonify({"error": "Maintenance record is already completed."}), 409

    db.maintenance.update_one({"_id": oid}, {"$set": {"status": "Completed"}})
    _restore_vehicle_if_no_active_maintenance(existing["vehicle_id"])

    updated = db.maintenance.find_one({"_id": oid})
    return jsonify(MaintenanceResponse(updated))


@maintenance_bp.route("/<maintenance_id>", methods=["DELETE"])
@login_required
@role_required("Fleet Manager")
def delete_maintenance(maintenance_id):
    oid = parse_object_id(maintenance_id)
    if not oid:
        return not_found("Maintenance record")

    existing = db.maintenance.find_one({"_id": oid})
    if not existing:
        return not_found("Maintenance record")

    vehicle_oid = existing["vehicle_id"]
    was_pending = existing.get("status") == "Pending"

    db.maintenance.delete_one({"_id": oid})

    if was_pending:
        _restore_vehicle_if_no_active_maintenance(vehicle_oid)

    return jsonify({"message": "Maintenance record deleted successfully."})

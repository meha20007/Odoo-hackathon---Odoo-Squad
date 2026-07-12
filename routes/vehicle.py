from bson import ObjectId
from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from database.db import db
from models.vehicles import VehicleEntry
from rbac import login_required, role_required
from utils.helpers import not_found, parse_object_id, validation_error_response

# NOTE: this file replaces the old routes/vehicle.py. It aligns the vehicle
# document shape with models/vehicles.py (VehicleEntry) which is what
# reports.py and seed_data.py already assume: vehicle_name,
# registration_number, vehicle_type, max_load_capacity, odometer,
# acquisition_cost, status. The previous version used a different shape
# (make/model/license_plate/year) that reports.py never read, so fuel
# efficiency / operational cost / ROI numbers were silently wrong.

vehicle_bp = Blueprint("vehicle", __name__, url_prefix="/api/vehicles")


def _serialize_vehicle(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "registration_number": doc.get("registration_number"),
        "vehicle_name": doc.get("vehicle_name"),
        "vehicle_type": doc.get("vehicle_type"),
        "max_load_capacity": doc.get("max_load_capacity"),
        "odometer": doc.get("odometer"),
        "acquisition_cost": doc.get("acquisition_cost"),
        "status": doc.get("status"),
    }


def _build_vehicle_query():
    query = {}
    status = request.args.get("status")
    vehicle_type = request.args.get("vehicle_type")

    if status:
        query["status"] = status
    if vehicle_type:
        query["vehicle_type"] = vehicle_type

    return query


@vehicle_bp.route("", methods=["GET"])
@login_required
def list_vehicles():
    vehicles = list(db.vehicles.find(_build_vehicle_query()).sort("vehicle_name", 1))
    return jsonify([_serialize_vehicle(v) for v in vehicles])


@vehicle_bp.route("/available", methods=["GET"])
@login_required
def list_available_vehicles():
    """Vehicles eligible for dispatch. Retired/In Shop must never appear here."""
    vehicles = list(db.vehicles.find({"status": "Available"}).sort("vehicle_name", 1))
    return jsonify([_serialize_vehicle(v) for v in vehicles])


@vehicle_bp.route("/<vehicle_id>", methods=["GET"])
@login_required
def get_vehicle(vehicle_id):
    oid = parse_object_id(vehicle_id)
    if not oid:
        return not_found("Vehicle")

    vehicle = db.vehicles.find_one({"_id": oid})
    if not vehicle:
        return not_found("Vehicle")

    return jsonify(_serialize_vehicle(vehicle))


@vehicle_bp.route("", methods=["POST"])
@login_required
@role_required("Fleet Manager")
def create_vehicle():
    payload = request.get_json(silent=True) or {}
    try:
        vehicle = VehicleEntry(**payload)
    except ValidationError as error:
        return validation_error_response(error)

    if db.vehicles.find_one({"registration_number": vehicle.registration_number}):
        return jsonify({"error": "A vehicle with this registration number already exists."}), 409

    result = db.vehicles.insert_one(vehicle.model_dump())
    created = db.vehicles.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_vehicle(created)), 201


@vehicle_bp.route("/<vehicle_id>", methods=["PUT", "PATCH"])
@login_required
@role_required("Fleet Manager")
def update_vehicle(vehicle_id):
    oid = parse_object_id(vehicle_id)
    if not oid:
        return not_found("Vehicle")

    existing = db.vehicles.find_one({"_id": oid})
    if not existing:
        return not_found("Vehicle")

    payload = request.get_json(silent=True) or {}
    merged = {**existing, **payload}
    merged.pop("_id", None)

    try:
        vehicle = VehicleEntry(**merged)
    except ValidationError as error:
        return validation_error_response(error)

    duplicate = db.vehicles.find_one(
        {"registration_number": vehicle.registration_number, "_id": {"$ne": oid}}
    )
    if duplicate:
        return jsonify({"error": "A vehicle with this registration number already exists."}), 409

    # Guard: don't let a manual status edit contradict an active dispatch/maintenance state.
    if existing.get("status") == "On Trip" and vehicle.status != "On Trip":
        active_trip = db.trips.find_one({"vehicle_id": oid, "status": "Dispatched"})
        if active_trip:
            return jsonify({"error": "Vehicle is on an active trip and cannot change status yet."}), 409

    if existing.get("status") == "In Shop" and vehicle.status not in ("In Shop", "Retired"):
        pending_maintenance = db.maintenance.find_one({"vehicle_id": oid, "status": "Pending"})
        if pending_maintenance:
            return jsonify({"error": "Vehicle has pending maintenance and cannot change status yet."}), 409

    db.vehicles.update_one({"_id": oid}, {"$set": vehicle.model_dump()})
    updated = db.vehicles.find_one({"_id": oid})
    return jsonify(_serialize_vehicle(updated))


@vehicle_bp.route("/<vehicle_id>", methods=["DELETE"])
@login_required
@role_required("Fleet Manager")
def delete_vehicle(vehicle_id):
    oid = parse_object_id(vehicle_id)
    if not oid:
        return not_found("Vehicle")

    vehicle = db.vehicles.find_one({"_id": oid})
    if not vehicle:
        return not_found("Vehicle")

    if vehicle.get("status") == "On Trip":
        return jsonify({"error": "Cannot delete a vehicle currently on a trip."}), 409

    active_trip = db.trips.find_one({"vehicle_id": oid, "status": {"$in": ["Draft", "Dispatched"]}})
    if active_trip:
        return jsonify({"error": "Cannot delete a vehicle assigned to an active trip."}), 409

    db.vehicles.delete_one({"_id": oid})
    return jsonify({"message": "Vehicle deleted successfully."})
from datetime import datetime

from bson import ObjectId
from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from database.db import db
from models.trips import TripEntry
from rbac import login_required, role_required
from utils.helpers import (
    is_driver_assignable,
    is_license_valid,
    not_found,
    parse_object_id,
    validation_error_response,
)

# NOTE: this replaces the old routes/trip.py. Key fixes:
#   1. Status values now match the spec / reports.py / dashboard KPIs:
#      Draft -> Dispatched -> Completed / Cancelled  (was lowercase
#      scheduled/ongoing/completed/cancelled, which meant reports.py's
#      active_trips/pending_trips counts always matched zero trips).
#   2. vehicle_id / driver_id are stored as ObjectId, not str, so
#      reports.py's _vehicle_distance() and fuel.py's _validate_references()
#      (which both compare against ObjectId) actually match trip documents.
#   3. Dispatching a trip now sets vehicle + driver to "On Trip"; completing
#      or cancelling a dispatched trip restores both to "Available" -
#      this enforces the mandatory business rules from the spec that the
#      previous version didn't implement at all.
#   4. Cargo weight is validated against the selected vehicle's
#      max_load_capacity at creation time.

trip_bp = Blueprint("trip", __name__, url_prefix="/api/trips")


def _serialize_trip(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "source": doc.get("source"),
        "destination": doc.get("destination"),
        "vehicle_id": str(doc.get("vehicle_id")) if doc.get("vehicle_id") else None,
        "driver_id": str(doc.get("driver_id")) if doc.get("driver_id") else None,
        "cargo_weight": doc.get("cargo_weight"),
        "planned_distance": doc.get("planned_distance"),
        "actual_distance": doc.get("actual_distance"),
        "start_time": doc["start_time"].isoformat() if isinstance(doc.get("start_time"), datetime) else doc.get("start_time"),
        "end_time": doc["end_time"].isoformat() if isinstance(doc.get("end_time"), datetime) else doc.get("end_time"),
        "revenue": doc.get("revenue"),
        "status": doc.get("status"),
    }


def _build_trip_query():
    query = {}
    status = request.args.get("status")
    vehicle_id = request.args.get("vehicle_id")
    driver_id = request.args.get("driver_id")

    if status:
        query["status"] = status
    if vehicle_id:
        oid = parse_object_id(vehicle_id)
        if oid:
            query["vehicle_id"] = oid
    if driver_id:
        oid = parse_object_id(driver_id)
        if oid:
            query["driver_id"] = oid

    return query


@trip_bp.route("", methods=["GET"])
@login_required
def list_trips():
    trips = list(db.trips.find(_build_trip_query()).sort("start_time", -1))
    return jsonify([_serialize_trip(t) for t in trips])


@trip_bp.route("/<trip_id>", methods=["GET"])
@login_required
def get_trip(trip_id):
    oid = parse_object_id(trip_id)
    if not oid:
        return not_found("Trip")

    trip = db.trips.find_one({"_id": oid})
    if not trip:
        return not_found("Trip")

    return jsonify(_serialize_trip(trip))


@trip_bp.route("", methods=["POST"])
@login_required
@role_required("Fleet Manager", "Dispatcher")
def create_trip():
    payload = request.get_json(silent=True) or {}
    try:
        trip = TripEntry(**payload)
    except ValidationError as error:
        return validation_error_response(error)

    vehicle_oid = parse_object_id(trip.vehicle_id)
    driver_oid = parse_object_id(trip.driver_id)
    if not vehicle_oid or not driver_oid:
        return jsonify({"error": "Invalid vehicle_id or driver_id."}), 400

    vehicle = db.vehicles.find_one({"_id": vehicle_oid})
    if not vehicle:
        return not_found("Vehicle")
    if vehicle.get("status") != "Available":
        return jsonify({"error": f"Vehicle is currently '{vehicle.get('status')}' and cannot be assigned."}), 409

    driver = db.drivers.find_one({"_id": driver_oid})
    if not driver:
        return not_found("Driver")
    if not is_driver_assignable(driver):
        return jsonify({"error": "Driver is not available (off duty, suspended, or license expired)."}), 409
    if not is_license_valid(driver):
        return jsonify({"error": "Driver's license is expired or invalid."}), 409

    if trip.cargo_weight > vehicle.get("max_load_capacity", 0):
        return jsonify(
            {
                "error": "Cargo weight exceeds vehicle's maximum load capacity.",
                "max_load_capacity": vehicle.get("max_load_capacity"),
            }
        ), 422

    document = trip.model_dump()
    document["vehicle_id"] = vehicle_oid
    document["driver_id"] = driver_oid

    result = db.trips.insert_one(document)
    created = db.trips.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_trip(created)), 201


@trip_bp.route("/<trip_id>", methods=["PUT", "PATCH"])
@login_required
@role_required("Fleet Manager", "Dispatcher")
def update_trip(trip_id):
    oid = parse_object_id(trip_id)
    if not oid:
        return not_found("Trip")

    existing = db.trips.find_one({"_id": oid})
    if not existing:
        return not_found("Trip")

    if existing.get("status") != "Draft":
        return jsonify({"error": "Only Draft trips can be edited. Use dispatch/complete/cancel for status changes."}), 409

    payload = request.get_json(silent=True) or {}
    merged = {**existing, **payload}
    merged.pop("_id", None)
    merged["vehicle_id"] = str(merged.get("vehicle_id", ""))
    merged["driver_id"] = str(merged.get("driver_id", ""))

    try:
        trip = TripEntry(**merged)
    except ValidationError as error:
        return validation_error_response(error)

    vehicle_oid = parse_object_id(trip.vehicle_id)
    driver_oid = parse_object_id(trip.driver_id)
    if not vehicle_oid or not driver_oid:
        return jsonify({"error": "Invalid vehicle_id or driver_id."}), 400

    vehicle = db.vehicles.find_one({"_id": vehicle_oid})
    if not vehicle:
        return not_found("Vehicle")
    if trip.cargo_weight > vehicle.get("max_load_capacity", 0):
        return jsonify({"error": "Cargo weight exceeds vehicle's maximum load capacity."}), 422

    document = trip.model_dump()
    document["vehicle_id"] = vehicle_oid
    document["driver_id"] = driver_oid

    db.trips.update_one({"_id": oid}, {"$set": document})
    updated = db.trips.find_one({"_id": oid})
    return jsonify(_serialize_trip(updated))


@trip_bp.route("/<trip_id>/dispatch", methods=["POST"])
@login_required
@role_required("Fleet Manager", "Dispatcher")
def dispatch_trip(trip_id):
    oid = parse_object_id(trip_id)
    if not oid:
        return not_found("Trip")

    trip = db.trips.find_one({"_id": oid})
    if not trip:
        return not_found("Trip")

    if trip.get("status") != "Draft":
        return jsonify({"error": f"Cannot dispatch a trip from status '{trip.get('status')}'."}), 409

    vehicle = db.vehicles.find_one({"_id": trip["vehicle_id"]})
    driver = db.drivers.find_one({"_id": trip["driver_id"]})

    if not vehicle or vehicle.get("status") != "Available":
        return jsonify({"error": "Assigned vehicle is no longer available."}), 409
    if not driver or not is_driver_assignable(driver) or not is_license_valid(driver):
        return jsonify({"error": "Assigned driver is no longer available."}), 409

    db.trips.update_one({"_id": oid}, {"$set": {"status": "Dispatched"}})
    db.vehicles.update_one({"_id": trip["vehicle_id"]}, {"$set": {"status": "On Trip"}})
    db.drivers.update_one({"_id": trip["driver_id"]}, {"$set": {"status": "On Trip"}})

    updated = db.trips.find_one({"_id": oid})
    return jsonify(_serialize_trip(updated))


@trip_bp.route("/<trip_id>/complete", methods=["POST"])
@login_required
@role_required("Fleet Manager", "Dispatcher")
def complete_trip(trip_id):
    oid = parse_object_id(trip_id)
    if not oid:
        return not_found("Trip")

    trip = db.trips.find_one({"_id": oid})
    if not trip:
        return not_found("Trip")

    if trip.get("status") != "Dispatched":
        return jsonify({"error": f"Cannot complete a trip from status '{trip.get('status')}'."}), 409

    payload = request.get_json(silent=True) or {}
    update_fields = {"status": "Completed", "end_time": datetime.utcnow()}

    if "actual_distance" in payload:
        try:
            update_fields["actual_distance"] = float(payload["actual_distance"])
        except (TypeError, ValueError):
            return jsonify({"error": "actual_distance must be a number."}), 400

    db.trips.update_one({"_id": oid}, {"$set": update_fields})
    db.vehicles.update_one({"_id": trip["vehicle_id"]}, {"$set": {"status": "Available"}})
    db.drivers.update_one({"_id": trip["driver_id"]}, {"$set": {"status": "Available"}})

    updated = db.trips.find_one({"_id": oid})
    return jsonify(_serialize_trip(updated))


@trip_bp.route("/<trip_id>/cancel", methods=["POST"])
@login_required
@role_required("Fleet Manager", "Dispatcher")
def cancel_trip(trip_id):
    oid = parse_object_id(trip_id)
    if not oid:
        return not_found("Trip")

    trip = db.trips.find_one({"_id": oid})
    if not trip:
        return not_found("Trip")

    if trip.get("status") not in ("Draft", "Dispatched"):
        return jsonify({"error": f"Cannot cancel a trip from status '{trip.get('status')}'."}), 409

    was_dispatched = trip.get("status") == "Dispatched"
    db.trips.update_one({"_id": oid}, {"$set": {"status": "Cancelled"}})

    if was_dispatched:
        db.vehicles.update_one({"_id": trip["vehicle_id"]}, {"$set": {"status": "Available"}})
        db.drivers.update_one({"_id": trip["driver_id"]}, {"$set": {"status": "Available"}})

    updated = db.trips.find_one({"_id": oid})
    return jsonify(_serialize_trip(updated))


@trip_bp.route("/<trip_id>", methods=["DELETE"])
@login_required
@role_required("Fleet Manager")
def delete_trip(trip_id):
    oid = parse_object_id(trip_id)
    if not oid:
        return not_found("Trip")

    trip = db.trips.find_one({"_id": oid})
    if not trip:
        return not_found("Trip")

    if trip.get("status") == "Dispatched":
        return jsonify({"error": "Cannot delete a trip that is currently dispatched."}), 409

    db.trips.delete_one({"_id": oid})
    return jsonify({"message": "Trip deleted successfully."})
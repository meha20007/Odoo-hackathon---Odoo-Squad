from datetime import date

from bson import ObjectId
from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from database.db import db
from models.drivers import DriverEntry
from rbac import login_required, role_required
from schemas.drivers import DriverEntry as DriverResponse, DriverList
from utils.helpers import (
    is_driver_assignable,
    is_license_valid,
    not_found,
    parse_object_id,
    serialize_dates,
    validation_error_response,
)

drivers_bp = Blueprint("drivers", __name__, url_prefix="/api/drivers")


def _build_driver_query():
    query = {}
    status = request.args.get("status")
    license_expired = request.args.get("license_expired")

    if status:
        query["status"] = status

    if license_expired is not None:
        today = date.today().isoformat()
        if license_expired.lower() in ("true", "1", "yes"):
            query["license_expiry"] = {"$lt": today}
        elif license_expired.lower() in ("false", "0", "no"):
            query["license_expiry"] = {"$gte": today}

    return query


@drivers_bp.route("", methods=["GET"])
@login_required
def list_drivers():
    drivers = list(db.drivers.find(_build_driver_query()).sort("name", 1))
    return jsonify(DriverList(drivers))


@drivers_bp.route("/available", methods=["GET"])
@login_required
def list_available_drivers():
    today = date.today().isoformat()
    drivers = list(
        db.drivers.find(
            {
                "status": "Available",
                "license_expiry": {"$gte": today},
            }
        ).sort("name", 1)
    )
    return jsonify(DriverList(drivers))


@drivers_bp.route("/<driver_id>", methods=["GET"])
@login_required
def get_driver(driver_id):
    oid = parse_object_id(driver_id)
    if not oid:
        return not_found("Driver")

    driver = db.drivers.find_one({"_id": oid})
    if not driver:
        return not_found("Driver")

    response = DriverResponse(driver)
    response["license_valid"] = is_license_valid(driver)
    response["assignable"] = is_driver_assignable(driver)
    return jsonify(response)


@drivers_bp.route("", methods=["POST"])
@login_required
@role_required("Fleet Manager", "Safety Officer")
def create_driver():
    payload = request.get_json(silent=True) or {}
    try:
        driver = DriverEntry(**payload)
    except ValidationError as error:
        return validation_error_response(error)

    if db.drivers.find_one({"license_number": driver.license_number}):
        return jsonify({"error": "A driver with this license number already exists."}), 409

    document = serialize_dates(driver.model_dump())
    result = db.drivers.insert_one(document)
    created = db.drivers.find_one({"_id": result.inserted_id})
    return jsonify(DriverResponse(created)), 201


@drivers_bp.route("/<driver_id>", methods=["PUT", "PATCH"])
@login_required
@role_required("Fleet Manager", "Safety Officer")
def update_driver(driver_id):
    oid = parse_object_id(driver_id)
    if not oid:
        return not_found("Driver")

    existing = db.drivers.find_one({"_id": oid})
    if not existing:
        return not_found("Driver")

    payload = request.get_json(silent=True) or {}
    merged = {**existing, **payload}
    merged.pop("_id", None)

    try:
        driver = DriverEntry(**merged)
    except ValidationError as error:
        return validation_error_response(error)

    duplicate = db.drivers.find_one(
        {"license_number": driver.license_number, "_id": {"$ne": oid}}
    )
    if duplicate:
        return jsonify({"error": "A driver with this license number already exists."}), 409

    if existing.get("status") == "On Trip" and driver.status != "On Trip":
        active_trip = db.trips.find_one(
            {"driver_id": oid, "status": "Dispatched"}
        )
        if active_trip:
            return jsonify(
                {"error": "Driver is on an active trip and cannot change status yet."}
            ), 409

    document = serialize_dates(driver.model_dump())
    db.drivers.update_one({"_id": oid}, {"$set": document})
    updated = db.drivers.find_one({"_id": oid})
    return jsonify(DriverResponse(updated))


@drivers_bp.route("/<driver_id>", methods=["DELETE"])
@login_required
@role_required("Fleet Manager")
def delete_driver(driver_id):
    oid = parse_object_id(driver_id)
    if not oid:
        return not_found("Driver")

    driver = db.drivers.find_one({"_id": oid})
    if not driver:
        return not_found("Driver")

    if driver.get("status") == "On Trip":
        return jsonify({"error": "Cannot delete a driver currently on a trip."}), 409

    active_trip = db.trips.find_one({"driver_id": oid, "status": {"$in": ["Draft", "Dispatched"]}})
    if active_trip:
        return jsonify({"error": "Cannot delete a driver assigned to an active trip."}), 409

    db.drivers.delete_one({"_id": oid})
    return jsonify({"message": "Driver deleted successfully."})

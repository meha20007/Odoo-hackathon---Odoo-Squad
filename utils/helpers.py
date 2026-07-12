from datetime import date, datetime

from bson import ObjectId
from flask import jsonify
from pydantic import ValidationError


def parse_object_id(value: str):
    try:
        return ObjectId(value)
    except Exception:
        return None


def serialize_dates(document: dict) -> dict:
    serialized = {}
    for key, value in document.items():
        if isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, date):
            serialized[key] = value.isoformat()
        elif isinstance(value, ObjectId):
            serialized[key] = str(value)
        else:
            serialized[key] = value
    return serialized


def validation_error_response(error: ValidationError):
    return jsonify({"error": "Validation failed.", "details": error.errors()}), 422


def not_found(resource: str):
    return jsonify({"error": f"{resource} not found."}), 404


def parse_date(value) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        return date.fromisoformat(value)
    return None


def is_license_valid(driver: dict) -> bool:
    expiry = parse_date(driver.get("license_expiry"))
    return expiry is not None and expiry >= date.today()


def is_driver_assignable(driver: dict) -> bool:
    if driver.get("status") == "Suspended":
        return False
    if driver.get("status") != "Available":
        return False
    return is_license_valid(driver)

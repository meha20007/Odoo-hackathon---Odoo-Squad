import os
import re
from flask import Blueprint, request, jsonify, session
from bson import ObjectId
from rbac import login_required, role_required

# 1. MongoDB Connection Setup (with fallback if database/db.py is empty or unavailable)
try:
    from database.db import db
    if db is None:
        raise AttributeError
except (ImportError, AttributeError):
    from pymongo import MongoClient
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/odoo_hackathon")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        client.server_info()
        db = client.get_default_database()
        if db is None:
            db = client["odoo_hackathon"]
    except Exception:
        client = MongoClient(MONGO_URI)
        db = client["odoo_hackathon"]

# 2. Dynamic Teammate Model Integration
# If teammate creates a Vehicle model in database.models or models, we dynamically import it.
# Otherwise, we use direct pymongo queries against the 'vehicles' collection.
VehicleModel = None
for model_path in ["database.models", "models", "models.vehicle"]:
    try:
        module = __import__(model_path, fromlist=["Vehicle"])
        VehicleModel = getattr(module, "Vehicle")
        break
    except (ImportError, AttributeError):
        continue

# Valid vehicle types (matches schemas/vehicles.py Literal options)
VALID_VEHICLE_TYPES = ["Truck", "Van", "Mini Truck", "Pickup", "Bus", "Other"]

# Valid statuses (matches schemas/vehicles.py Literal options)
VALID_STATUSES = ["Available", "On Trip", "In Shop", "Retired"]

# Mapping from old internal status values to the new shared schema values,
# kept only so existing data/status transitions still make sense.
STATUS_MAP = {
    "active": "Available",
    "maintenance": "In Shop",
    "inactive": "Retired"
}


# Fallback helper class representing the expected interface
class VehicleFallback:
    @staticmethod
    def find_by_id(vehicle_id):
        try:
            if isinstance(vehicle_id, str):
                vehicle_id = ObjectId(vehicle_id)
            return db.vehicles.find_one({"_id": vehicle_id})
        except Exception:
            return None

    @staticmethod
    def get_all():
        return list(db.vehicles.find())

    @staticmethod
    def find_by_plate(plate):
        return db.vehicles.find_one({"registration_number": plate.strip().upper()})

    @staticmethod
    def create(make, model, license_plate, vehicle_type, max_load_capacity,
               year=None, odometer=0.0, acquisition_cost=0.0, status="Available"):
        vehicle_data = {
            "make": make.strip(),
            "model": model.strip(),
            "vehicle_name": f"{make.strip()} {model.strip()}",
            "vehicle_type": vehicle_type,
            "registration_number": license_plate.strip().upper(),
            "max_load_capacity": float(max_load_capacity),
            "odometer": float(odometer),
            "acquisition_cost": float(acquisition_cost),
            "status": status
        }
        if year is not None:
            vehicle_data["year"] = int(year)

        result = db.vehicles.insert_one(vehicle_data)
        vehicle_data["_id"] = result.inserted_id
        return vehicle_data

    @staticmethod
    def update(vehicle_id, update_data):
        try:
            if isinstance(vehicle_id, str):
                vehicle_id = ObjectId(vehicle_id)
            # Ensure proper types
            if "year" in update_data:
                update_data["year"] = int(update_data["year"])
            if "max_load_capacity" in update_data:
                update_data["max_load_capacity"] = float(update_data["max_load_capacity"])
            if "odometer" in update_data:
                update_data["odometer"] = float(update_data["odometer"])
            if "acquisition_cost" in update_data:
                update_data["acquisition_cost"] = float(update_data["acquisition_cost"])
            if "registration_number" in update_data:
                update_data["registration_number"] = update_data["registration_number"].strip().upper()
            # Keep vehicle_name in sync if make/model changes
            if "make" in update_data or "model" in update_data:
                current = db.vehicles.find_one({"_id": vehicle_id}) or {}
                new_make = update_data.get("make", current.get("make", "")).strip()
                new_model = update_data.get("model", current.get("model", "")).strip()
                update_data["make"] = new_make
                update_data["model"] = new_model
                update_data["vehicle_name"] = f"{new_make} {new_model}"

            result = db.vehicles.update_one({"_id": vehicle_id}, {"$set": update_data})
            return result.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def delete(vehicle_id):
        try:
            if isinstance(vehicle_id, str):
                vehicle_id = ObjectId(vehicle_id)
            result = db.vehicles.delete_one({"_id": vehicle_id})
            return result.deleted_count > 0
        except Exception:
            return False

db_vehicle_helper = VehicleModel if VehicleModel is not None else VehicleFallback


# 3. Validation Logic
def validate_vehicle_data(data, is_update=False):
    """
    Validates input fields for a vehicle record.
    Returns (validated_dict, error_message).
    """
    errors = []
    validated = {}

    # Define fields
    make = data.get("make")
    model = data.get("model")
    year = data.get("year")
    license_plate = data.get("registration_number")
    vehicle_type = data.get("vehicle_type")
    max_load_capacity = data.get("max_load_capacity")
    odometer = data.get("odometer")
    acquisition_cost = data.get("acquisition_cost")
    status = data.get("status", "Available")

    # If it's update, only validate provided fields
    if not is_update or make is not None:
        if not make or not isinstance(make, str) or not make.strip():
            errors.append("Make is required and must be a valid string.")
        else:
            validated["make"] = make.strip()

    if not is_update or model is not None:
        if not model or not isinstance(model, str) or not model.strip():
            errors.append("Model is required and must be a valid string.")
        else:
            validated["model"] = model.strip()

    if year is not None:
        try:
            year_val = int(year)
            if year_val < 1900 or year_val > 2100:
                errors.append("Year must be between 1900 and 2100.")
            else:
                validated["year"] = year_val
        except (ValueError, TypeError):
            errors.append("Year must be a valid integer.")

    if not is_update or license_plate is not None:
        if not license_plate or not isinstance(license_plate, str):
            errors.append("Registration number is required.")
        else:
            plate_clean = license_plate.strip().upper()
            # Standard registration number format validation: alphanumeric 5-20 characters
            if not re.match(r"^[A-Z0-9\-]{5,20}$", plate_clean):
                errors.append("Registration number must be 5 to 20 alphanumeric characters (hyphens allowed).")
            else:
                validated["license_plate"] = plate_clean

    if not is_update or vehicle_type is not None:
        if vehicle_type not in VALID_VEHICLE_TYPES:
            errors.append(f"Vehicle type must be one of {VALID_VEHICLE_TYPES}")
        else:
            validated["vehicle_type"] = vehicle_type

    if not is_update or max_load_capacity is not None:
        try:
            cap_val = float(max_load_capacity)
            if cap_val <= 0:
                errors.append("Max load capacity must be greater than 0.")
            else:
                validated["max_load_capacity"] = cap_val
        except (ValueError, TypeError):
            errors.append("Max load capacity must be a valid number.")

    if odometer is not None:
        try:
            odo_val = float(odometer)
            if odo_val < 0:
                errors.append("Odometer cannot be negative.")
            else:
                validated["odometer"] = odo_val
        except (ValueError, TypeError):
            errors.append("Odometer must be a valid number.")
    elif not is_update:
        validated["odometer"] = 0.0

    if acquisition_cost is not None:
        try:
            cost_val = float(acquisition_cost)
            if cost_val < 0:
                errors.append("Acquisition cost cannot be negative.")
            else:
                validated["acquisition_cost"] = cost_val
        except (ValueError, TypeError):
            errors.append("Acquisition cost must be a valid number.")
    elif not is_update:
        validated["acquisition_cost"] = 0.0

    if status is not None:
        # Accept legacy status values too, and translate them
        if status in STATUS_MAP:
            status = STATUS_MAP[status]
        if status not in VALID_STATUSES:
            errors.append(f"Status must be one of {VALID_STATUSES}")
        else:
            validated["status"] = status

    if errors:
        return None, ", ".join(errors)
    return validated, None


# 4. Blueprint Routes
vehicle_bp = Blueprint("vehicle", __name__)

@vehicle_bp.route("", methods=["GET"])
@login_required
def get_vehicles():
    """Gets all vehicles (available to all logged-in users)."""
    vehicles = db_vehicle_helper.get_all()
    # Serialize ObjectId to string for JSON return
    for v in vehicles:
        v["_id"] = str(v["_id"])
    return jsonify(vehicles), 200


@vehicle_bp.route("/<vehicle_id>", methods=["GET"])
@login_required
def get_vehicle(vehicle_id):
    """Gets details for a single vehicle."""
    vehicle = db_vehicle_helper.find_by_id(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found."}), 404
    vehicle["_id"] = str(vehicle["_id"])
    return jsonify(vehicle), 200


@vehicle_bp.route("", methods=["POST"])
@role_required("admin")
def add_vehicle():
    """Creates a new vehicle (Admin only)."""
    data = request.get_json() or {}
    validated_data, error = validate_vehicle_data(data)
    if error:
        return jsonify({"error": error}), 400

    # Ensure unique registration number
    existing = db_vehicle_helper.find_by_plate(validated_data["license_plate"])
    if existing:
        return jsonify({"error": "A vehicle with this registration number already exists."}), 400

    vehicle = db_vehicle_helper.create(
        make=validated_data["make"],
        model=validated_data["model"],
        license_plate=validated_data["license_plate"],
        vehicle_type=validated_data["vehicle_type"],
        max_load_capacity=validated_data["max_load_capacity"],
        year=validated_data.get("year"),
        odometer=validated_data.get("odometer", 0.0),
        acquisition_cost=validated_data.get("acquisition_cost", 0.0),
        status=validated_data.get("status", "Available")
    )
    vehicle["_id"] = str(vehicle["_id"])
    return jsonify({"message": "Vehicle created successfully.", "vehicle": vehicle}), 201


@vehicle_bp.route("/<vehicle_id>", methods=["PUT"])
@role_required("admin")
def update_vehicle(vehicle_id):
    """Updates an existing vehicle details (Admin only)."""
    vehicle = db_vehicle_helper.find_by_id(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found."}), 404

    data = request.get_json() or {}
    validated_data, error = validate_vehicle_data(data, is_update=True)
    if error:
        return jsonify({"error": error}), 400

    if "license_plate" in validated_data:
        existing = db_vehicle_helper.find_by_plate(validated_data["license_plate"])
        if existing and str(existing["_id"]) != str(vehicle_id):
            return jsonify({"error": "Another vehicle already has this registration number."}), 400
        # rename key to match stored field
        validated_data["registration_number"] = validated_data.pop("license_plate")

    success = db_vehicle_helper.update(vehicle_id, validated_data)
    if not success:
        return jsonify({"error": "Failed to update vehicle or no changes were made."}), 400

    updated_vehicle = db_vehicle_helper.find_by_id(vehicle_id)
    updated_vehicle["_id"] = str(updated_vehicle["_id"])
    return jsonify({"message": "Vehicle updated successfully.", "vehicle": updated_vehicle}), 200


@vehicle_bp.route("/<vehicle_id>", methods=["DELETE"])
@role_required("admin")
def delete_vehicle(vehicle_id):
    """Deletes a vehicle from the system (Admin only)."""
    vehicle = db_vehicle_helper.find_by_id(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found."}), 404

    success = db_vehicle_helper.delete(vehicle_id)
    if not success:
        return jsonify({"error": "Failed to delete vehicle."}), 400

    return jsonify({"message": "Vehicle deleted successfully."}), 200
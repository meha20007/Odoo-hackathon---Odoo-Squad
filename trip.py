import os
from datetime import datetime
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
# Detects teammate's Trip model if it exists in models or database.models
TripModel = None
for model_path in ["database.models", "models", "models.trip"]:
    try:
        module = __import__(model_path, fromlist=["Trip"])
        TripModel = getattr(module, "Trip")
        break
    except (ImportError, AttributeError):
        continue

# Fallback helper class representing the expected interface
class TripFallback:
    @staticmethod
    def find_by_id(trip_id):
        try:
            if isinstance(trip_id, str):
                trip_id = ObjectId(trip_id)
            return db.trips.find_one({"_id": trip_id})
        except Exception:
            return None

    @staticmethod
    def get_all():
        return list(db.trips.find())

    @staticmethod
    def create(vehicle_id, driver_id, start_location, end_location, start_time, end_time, status="scheduled", distance=0.0):
        # Convert times to datetime objects if they are strings
        if isinstance(start_time, str):
            start_time = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        if isinstance(end_time, str):
            end_time = datetime.fromisoformat(end_time.replace("Z", "+00:00"))

        trip_data = {
            "vehicle_id": str(vehicle_id),
            "driver_id": str(driver_id),
            "start_location": start_location.strip(),
            "end_location": end_location.strip(),
            "start_time": start_time,
            "end_time": end_time,
            "status": status,
            "distance": float(distance)
        }
        result = db.trips.insert_one(trip_data)
        trip_data["_id"] = result.inserted_id
        return trip_data

    @staticmethod
    def update(trip_id, update_data):
        try:
            if isinstance(trip_id, str):
                trip_id = ObjectId(trip_id)
            
            # Format types
            if "start_time" in update_data and isinstance(update_data["start_time"], str):
                update_data["start_time"] = datetime.fromisoformat(update_data["start_time"].replace("Z", "+00:00"))
            if "end_time" in update_data and isinstance(update_data["end_time"], str):
                update_data["end_time"] = datetime.fromisoformat(update_data["end_time"].replace("Z", "+00:00"))
            if "distance" in update_data:
                update_data["distance"] = float(update_data["distance"])
            if "vehicle_id" in update_data:
                update_data["vehicle_id"] = str(update_data["vehicle_id"])
            if "driver_id" in update_data:
                update_data["driver_id"] = str(update_data["driver_id"])

            result = db.trips.update_one({"_id": trip_id}, {"$set": update_data})
            return result.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def delete(trip_id):
        try:
            if isinstance(trip_id, str):
                trip_id = ObjectId(trip_id)
            result = db.trips.delete_one({"_id": trip_id})
            return result.deleted_count > 0
        except Exception:
            return False

    @staticmethod
    def find_overlapping_trips(target_id, start_time, end_time, exclude_trip_id=None):
        """
        Finds any scheduled/ongoing trip that has overlapping times for a specific driver or vehicle.
        Overlap query: start_time < trip.end_time AND end_time > trip.start_time
        """
        if isinstance(start_time, str):
            start_time = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        if isinstance(end_time, str):
            end_time = datetime.fromisoformat(end_time.replace("Z", "+00:00"))

        query = {
            "status": {"$in": ["scheduled", "ongoing"]},
            "$or": [
                {"vehicle_id": str(target_id)},
                {"driver_id": str(target_id)}
            ],
            "start_time": {"$lt": end_time},
            "end_time": {"$gt": start_time}
        }

        if exclude_trip_id:
            try:
                if isinstance(exclude_trip_id, str):
                    exclude_trip_id = ObjectId(exclude_trip_id)
                query["_id"] = {"$ne": exclude_trip_id}
            except Exception:
                pass

        return list(db.trips.find(query))

db_trip_helper = TripModel if TripModel is not None else TripFallback


# 3. Validation and Lifecycle Utilities
def parse_datetime(dt_str):
    try:
        # standard ISO 8601 parser support (handles Z and offsets)
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def validate_trip_data(data, is_update=False):
    """
    Validates general fields and parameters for creating/updating a trip.
    Returns (validated_dict, error_message).
    """
    errors = []
    validated = {}

    vehicle_id = data.get("vehicle_id")
    driver_id = data.get("driver_id")
    start_location = data.get("start_location")
    end_location = data.get("end_location")
    start_time_str = data.get("start_time")
    end_time_str = data.get("end_time")
    distance = data.get("distance")
    status = data.get("status")

    if not is_update or vehicle_id is not None:
        if not vehicle_id:
            errors.append("Vehicle ID is required.")
        else:
            validated["vehicle_id"] = str(vehicle_id)

    if not is_update or driver_id is not None:
        if not driver_id:
            errors.append("Driver ID is required.")
        else:
            validated["driver_id"] = str(driver_id)

    if not is_update or start_location is not None:
        if not start_location or not isinstance(start_location, str) or not start_location.strip():
            errors.append("Start location must be a non-empty string.")
        else:
            validated["start_location"] = start_location.strip()

    if not is_update or end_location is not None:
        if not end_location or not isinstance(end_location, str) or not end_location.strip():
            errors.append("End location must be a non-empty string.")
        else:
            validated["end_location"] = end_location.strip()

    # Time validations
    start_time = None
    end_time = None

    if start_time_str is not None:
        start_time = parse_datetime(start_time_str)
        if not start_time:
            errors.append("start_time must be a valid ISO 8601 datetime string.")
        else:
            validated["start_time"] = start_time
            # For new trips, start time should be in the future
            if not is_update and start_time < datetime.now(start_time.tzinfo):
                errors.append("Start time must be in the future.")

    if end_time_str is not None:
        end_time = parse_datetime(end_time_str)
        if not end_time:
            errors.append("end_time must be a valid ISO 8601 datetime string.")
        else:
            validated["end_time"] = end_time

    # Cross time validation
    if start_time_str is not None and end_time_str is not None:
        if start_time and end_time and end_time <= start_time:
            errors.append("End time must be strictly after the start time.")

    if distance is not None:
        try:
            dist_val = float(distance)
            if dist_val < 0:
                errors.append("Distance cannot be negative.")
            else:
                validated["distance"] = dist_val
        except (ValueError, TypeError):
            errors.append("Distance must be a valid float.")

    if status is not None:
        valid_statuses = ["scheduled", "ongoing", "completed", "cancelled"]
        if status not in valid_statuses:
            errors.append(f"Status must be one of {valid_statuses}")
        else:
            validated["status"] = status

    if errors:
        return None, ", ".join(errors)
    return validated, None


# 4. Blueprint Routes
trip_bp = Blueprint("trip", __name__)

@trip_bp.route("", methods=["GET"])
@login_required
def get_trips():
    """Retrieves all trips (available to logged-in users)."""
    trips = db_trip_helper.get_all()
    for t in trips:
        t["_id"] = str(t["_id"])
        # Format datetimes to ISO string for JSON representation
        if isinstance(t.get("start_time"), datetime):
            t["start_time"] = t["start_time"].isoformat()
        if isinstance(t.get("end_time"), datetime):
            t["end_time"] = t["end_time"].isoformat()
    return jsonify(trips), 200


@trip_bp.route("/<trip_id>", methods=["GET"])
@login_required
def get_trip(trip_id):
    """Retrieves details of a single trip."""
    trip = db_trip_helper.find_by_id(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404
    
    trip["_id"] = str(trip["_id"])
    if isinstance(trip.get("start_time"), datetime):
        trip["start_time"] = trip["start_time"].isoformat()
    if isinstance(trip.get("end_time"), datetime):
        trip["end_time"] = trip["end_time"].isoformat()
    return jsonify(trip), 200


@trip_bp.route("", methods=["POST"])
@login_required
def create_trip():
    """Creates/Books a new trip (Checks for driver and vehicle schedule conflicts)."""
    data = request.get_json() or {}
    validated_data, error = validate_trip_data(data)
    if error:
        return jsonify({"error": error}), 400

    vehicle_id = validated_data["vehicle_id"]
    driver_id = validated_data["driver_id"]
    start_time = validated_data["start_time"]
    end_time = validated_data["end_time"]

    # Check vehicle existence and status
    vehicle = db.vehicles.find_one({"_id": ObjectId(vehicle_id)}) if db.vehicles else None
    if vehicle and vehicle.get("status") != "active":
        return jsonify({"error": f"Vehicle is currently in state '{vehicle.get('status')}' and cannot be booked."}), 400

    # Schedule overlap checking for vehicle
    vehicle_conflicts = db_trip_helper.find_overlapping_trips(vehicle_id, start_time, end_time)
    if vehicle_conflicts:
        return jsonify({"error": "The assigned vehicle is already booked for another trip during this timeframe."}), 400

    # Schedule overlap checking for driver
    driver_conflicts = db_trip_helper.find_overlapping_trips(driver_id, start_time, end_time)
    if driver_conflicts:
        return jsonify({"error": "The assigned driver is already booked for another trip during this timeframe."}), 400

    # Create trip
    trip = db_trip_helper.create(
        vehicle_id=vehicle_id,
        driver_id=driver_id,
        start_location=validated_data["start_location"],
        end_location=validated_data["end_location"],
        start_time=start_time,
        end_time=end_time,
        status=validated_data.get("status", "scheduled"),
        distance=validated_data.get("distance", 0.0)
    )
    trip["_id"] = str(trip["_id"])
    trip["start_time"] = trip["start_time"].isoformat()
    trip["end_time"] = trip["end_time"].isoformat()
    return jsonify({"message": "Trip booked successfully.", "trip": trip}), 201


@trip_bp.route("/<trip_id>/status", methods=["PUT"])
@login_required
def update_trip_status(trip_id):
    """Updates only the lifecycle status of a trip, enforcing transitions."""
    trip = db_trip_helper.find_by_id(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    data = request.get_json() or {}
    new_status = data.get("status")
    current_status = trip.get("status", "scheduled")

    valid_statuses = ["scheduled", "ongoing", "completed", "cancelled"]
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of {valid_statuses}"}), 400

    if current_status == new_status:
        return jsonify({"message": "Status is already set to target state.", "trip_id": str(trip_id)}), 200

    # Enforce lifecycle state machine rules
    # 1. Terminal states cannot transition
    if current_status in ["completed", "cancelled"]:
        return jsonify({"error": f"Cannot update status from terminal state '{current_status}'."}), 400

    # 2. Scheduled can go to ongoing or cancelled
    if current_status == "scheduled" and new_status not in ["ongoing", "cancelled"]:
        return jsonify({"error": f"Invalid transition from '{current_status}' to '{new_status}'."}), 400

    # 3. Ongoing can go to completed or cancelled
    if current_status == "ongoing" and new_status not in ["completed", "cancelled"]:
        return jsonify({"error": f"Invalid transition from '{current_status}' to '{new_status}'."}), 400

    # Update database
    success = db_trip_helper.update(trip_id, {"status": new_status})
    if not success:
        return jsonify({"error": "Failed to update trip status."}), 400

    return jsonify({"message": f"Trip status updated successfully to '{new_status}'."}), 200


@trip_bp.route("/<trip_id>", methods=["DELETE"])
@role_required("admin")
def delete_trip(trip_id):
    """Deletes a trip from records (Admin only)."""
    trip = db_trip_helper.find_by_id(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    success = db_trip_helper.delete(trip_id)
    if not success:
        return jsonify({"error": "Failed to delete trip."}), 400

    return jsonify({"message": "Trip record deleted successfully."}), 200

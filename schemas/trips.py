def TripEntry(item) -> dict:
    return {
        "id": str(item["_id"]),
        "source": item["source"],
        "destination": item["destination"],
        "vehicle_id": str(item["vehicle_id"]),
        "driver_id": str(item["driver_id"]),
        "cargo_weight": float(item["cargo_weight"]),
        "planned_distance": float(item["planned_distance"]),
        "actual_distance": float(item["actual_distance"]),
        "start_time": item["start_time"],
        "end_time": item.get("end_time"),
        "revenue": float(item["revenue"]),
        "status": item["status"]
    }


def TripList(items) -> list:
    return [TripEntry(item) for item in items]
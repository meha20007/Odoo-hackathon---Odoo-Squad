def FuelEntry(item) -> dict:
    return {
        "id": str(item["_id"]),
        "vehicle_id": str(item["vehicle_id"]),
        "trip_id": str(item["trip_id"]),
        "fuel_station": item["fuel_station"],
        "fuel_type": item["fuel_type"],
        "quantity": float(item["quantity"]),
        "cost_per_liter": float(item["cost_per_liter"]),
        "total_cost": float(item["total_cost"]),
        "fuel_date": item["fuel_date"]
    }


def FuelList(items) -> list:
    return [FuelEntry(item) for item in items]
def MaintenanceEntry(item) -> dict:
    return {
        "id": str(item["_id"]),
        "vehicle_id": str(item["vehicle_id"]),
        "maintenance_type": item["maintenance_type"],
        "description": item["description"],
        "cost": float(item["cost"]),
        "maintenance_date": item["maintenance_date"],
        "next_service_date": item.get("next_service_date"),
        "status": item["status"]
    }


def MaintenanceList(items) -> list:
    return [MaintenanceEntry(item) for item in items]
def DriverEntry(item) -> dict:
    return {
        "id": str(item["_id"]),
        "name": item["name"],
        "license_number": item["license_number"],
        "license_category": item["license_category"],
        "license_expiry": item["license_expiry"],
        "contact_number": item["contact_number"],
        "safety_score": float(item["safety_score"]),
        "status": item["status"]
    }


def DriverList(items) -> list:
    return [DriverEntry(item) for item in items]
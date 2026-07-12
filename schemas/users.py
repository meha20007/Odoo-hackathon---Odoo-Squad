def UserEntry(item) -> dict:
    return {
        "id": str(item["_id"]),
        "name": item["name"],
        "email": item["email"],
        "role": item["role"]
    }


def UserList(items) -> list:
    return [UserEntry(item) for item in items]

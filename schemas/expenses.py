def ExpenseEntry(item) -> dict:
    return {
        "id": str(item["_id"]),
        "user_id": str(item["user_id"]),
        "title": item["title"],
        "amount": float(item["amount"]),
        "category": item["category"],
        "description": item.get("description", None),
        "expense_date": item["expense_date"]
    }


def ExpenseList(items) -> list:
    return [ExpenseEntry(item) for item in items]
from pydantic import BaseModel
from typing import Optional, Literal


class ExpenseEntry(BaseModel):
    user_id: str
    title: str
    amount: float
    category: Literal[
        "Fuel",
        "Maintenance",
        "Repair",
        "Salary",
        "Insurance",
        "Other"
    ]
    description: Optional[str] = None
    expense_date: str
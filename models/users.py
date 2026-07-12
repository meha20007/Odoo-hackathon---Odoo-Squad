from pydantic import BaseModel, EmailStr
from typing import Literal


class UserEntry(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal[
        "Fleet Manager",
        "Dispatcher",
        "Safety Officer",
        "Financial Analyst"
    ]

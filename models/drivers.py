from pydantic import BaseModel, Field
from typing import Literal
from datetime import date


class DriverEntry(BaseModel):
    name: str
    license_number: str
    license_category: Literal[
        "LMV",
        "HMV",
        "MCWG",
        "Transport"
    ]
    license_expiry: date
    contact_number: str = Field(..., min_length=10, max_length=10)
    safety_score: float = Field(default=100, ge=0, le=100)
    status: Literal[
        "Available",
        "On Trip",
        "Off Duty",
        "Suspended"
    ] = "Available"
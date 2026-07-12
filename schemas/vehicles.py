from pydantic import BaseModel, Field
from typing import Literal


class VehicleEntry(BaseModel):
    registration_number: str = Field(..., min_length=5, max_length=20)
    vehicle_name: str
    vehicle_type: Literal[
        "Truck",
        "Van",
        "Mini Truck",
        "Pickup",
        "Bus",
        "Other"
    ]
    max_load_capacity: float = Field(..., gt=0)
    odometer: float = Field(..., ge=0)
    acquisition_cost: float = Field(..., ge=0)
    status: Literal[
        "Available",
        "On Trip",
        "In Shop",
        "Retired"
    ] = "Available"
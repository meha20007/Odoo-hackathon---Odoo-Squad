from pydantic import BaseModel, Field
from typing import Literal
from datetime import date


class MaintenanceEntry(BaseModel):
    vehicle_id: str

    maintenance_type: Literal[
        "Oil Change",
        "Engine Repair",
        "Brake Service",
        "Tyre Replacement",
        "Battery Replacement",
        "General Service",
        "Other"
    ]

    description: str

    cost: float = Field(..., ge=0)

    maintenance_date: date

    next_service_date: date | None = None

    status: Literal[
        "Pending",
        "Completed"
    ] = "Pending"
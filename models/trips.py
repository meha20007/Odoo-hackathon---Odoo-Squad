from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class TripEntry(BaseModel):
    source: str
    destination: str

    vehicle_id: str
    driver_id: str

    cargo_weight: float = Field(..., ge=0)
    planned_distance: float = Field(..., gt=0)

    actual_distance: float = Field(default=0, ge=0)

    start_time: datetime
    end_time: datetime | None = None

    revenue: float = Field(default=0, ge=0)

    status: Literal[
        "Draft",
        "Dispatched",
        "Completed",
        "Cancelled"
    ] = "Draft"
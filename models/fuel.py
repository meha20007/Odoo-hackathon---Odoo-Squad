from pydantic import BaseModel, Field
from datetime import date
from typing import Literal


class FuelEntry(BaseModel):
    vehicle_id: str

    trip_id: str

    fuel_station: str

    fuel_type: Literal["Diesel", "Petrol", "CNG", "Electric"] = "Diesel"

    quantity: float = Field(..., gt=0)

    cost_per_liter: float = Field(..., gt=0)

    total_cost: float = Field(..., gt=0)

    fuel_date: date

    odometer:float=Field(..., gt=0)
from pydantic import BaseModel, Field
from datetime import date


class FuelEntry(BaseModel):
    vehicle_id: str

    trip_id: str

    fuel_station: str

    fuel_type: str = "Diesel"

    quantity: float = Field(..., gt=0)

    cost_per_liter: float = Field(..., gt=0)

    total_cost: float = Field(..., gt=0)

    fuel_date: date
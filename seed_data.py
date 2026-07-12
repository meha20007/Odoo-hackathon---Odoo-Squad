"""Seed TransitOps demo data. Run: python seed_data.py"""

from datetime import date, datetime, timedelta

from bson import ObjectId
from werkzeug.security import generate_password_hash

from database.db import db

USERS = [
    {
        "email": "fleet@transitops.io",
        "password": "password123",
        "name": "Arjun Rao",
        "role": "Fleet Manager",
    },
    {
        "email": "dispatcher@transitops.io",
        "password": "password123",
        "name": "Priya Sharma",
        "role": "Dispatcher",
    },
]

VEHICLES = [
    {
        "make": "Tata",
        "model": "LPT 1613",
        "vehicle_name": "Tata LPT 1613",
        "vehicle_type": "Truck",
        "registration_number": "MH-12-AB-4521",
        "max_load_capacity": 9000,
        "odometer": 84200,
        "acquisition_cost": 1850000,
        "status": "Available",
        "year": 2021,
    },
    {
        "make": "Ashok Leyland",
        "model": "Boss 1415",
        "vehicle_name": "Ashok Leyland Boss",
        "vehicle_type": "Truck",
        "registration_number": "MH-14-CD-8832",
        "max_load_capacity": 7500,
        "odometer": 62100,
        "acquisition_cost": 1620000,
        "status": "On Trip",
        "year": 2020,
    },
    {
        "make": "Mahindra",
        "model": "Blazo X 28",
        "vehicle_name": "Mahindra Blazo X",
        "vehicle_type": "Truck",
        "registration_number": "GJ-01-EF-2290",
        "max_load_capacity": 12000,
        "odometer": 115400,
        "acquisition_cost": 2100000,
        "status": "Available",
        "year": 2019,
    },
    {
        "make": "Eicher",
        "model": "Pro 3015",
        "vehicle_name": "Eicher Pro 3015",
        "vehicle_type": "Truck",
        "registration_number": "DL-08-GH-7741",
        "max_load_capacity": 8500,
        "odometer": 45800,
        "acquisition_cost": 1750000,
        "status": "In Shop",
        "year": 2022,
    },
    {
        "make": "Force",
        "model": "Traveller 26",
        "vehicle_name": "Force Traveller",
        "vehicle_type": "Van",
        "registration_number": "KA-03-IJ-5510",
        "max_load_capacity": 2500,
        "odometer": 38900,
        "acquisition_cost": 980000,
        "status": "Available",
        "year": 2023,
    },
]

DRIVERS = [
    {
        "name": "Rajesh Kumar",
        "license_number": "MH2019004521",
        "license_category": "HMV",
        "license_expiry": "2027-06-15",
        "contact_number": "9876543210",
        "safety_score": 92,
        "status": "Available",
    },
    {
        "name": "Suresh Patel",
        "license_number": "GJ2018008832",
        "license_category": "HMV",
        "license_expiry": "2026-12-20",
        "contact_number": "9876543211",
        "safety_score": 88,
        "status": "On Trip",
    },
    {
        "name": "Amit Singh",
        "license_number": "DL2020002290",
        "license_category": "Transport",
        "license_expiry": "2028-03-10",
        "contact_number": "9876543212",
        "safety_score": 95,
        "status": "Available",
    },
    {
        "name": "Vikram Desai",
        "license_number": "KA2021007741",
        "license_category": "LMV",
        "license_expiry": "2026-08-05",
        "contact_number": "9876543213",
        "safety_score": 78,
        "status": "Off Duty",
    },
]


def clear_collections():
    for name in ("users", "vehicles", "drivers", "trips", "fuel_logs", "maintenance"):
        db[name].delete_many({})


def seed_users():
    for user in USERS:
        db.users.insert_one(
            {
                "email": user["email"],
                "password_hash": generate_password_hash(user["password"]),
                "name": user["name"],
                "role": user["role"],
            }
        )


def seed_vehicles():
    ids = []
    for vehicle in VEHICLES:
        result = db.vehicles.insert_one(vehicle)
        ids.append(result.inserted_id)
    return ids


def seed_drivers():
    ids = []
    for driver in DRIVERS:
        result = db.drivers.insert_one(driver)
        ids.append(result.inserted_id)
    return ids


def seed_trips(vehicle_ids, driver_ids):
    now = datetime.now()
    trips = [
        {
            "vehicle_id": str(vehicle_ids[1]),
            "driver_id": str(driver_ids[1]),
            "source": "Mumbai, MH",
            "destination": "Pune, MH",
            "start_time": (now - timedelta(hours=2)).isoformat(),
            "end_time": (now + timedelta(hours=4)).isoformat(),
            "status": "ongoing",
            "cargo_weight": 6500,
            "planned_distance": 148,
            "actual_distance": 0,
            "revenue": 18500,
        },
        {
            "vehicle_id": str(vehicle_ids[0]),
            "driver_id": str(driver_ids[0]),
            "source": "Ahmedabad, GJ",
            "destination": "Surat, GJ",
            "start_time": (now + timedelta(days=1)).isoformat(),
            "end_time": (now + timedelta(days=1, hours=6)).isoformat(),
            "status": "scheduled",
            "cargo_weight": 4200,
            "planned_distance": 265,
            "actual_distance": 0,
            "revenue": 22000,
        },
        {
            "vehicle_id": str(vehicle_ids[2]),
            "driver_id": str(driver_ids[2]),
            "source": "Delhi, DL",
            "destination": "Jaipur, RJ",
            "start_time": (now - timedelta(days=3)).isoformat(),
            "end_time": (now - timedelta(days=2, hours=18)).isoformat(),
            "status": "completed",
            "cargo_weight": 8000,
            "planned_distance": 280,
            "actual_distance": 275,
            "revenue": 35000,
        },
    ]
    trip_ids = []
    for trip in trips:
        result = db.trips.insert_one(trip)
        trip_ids.append(result.inserted_id)
    return trip_ids


def seed_maintenance(vehicle_ids):
    records = [
        {
            "vehicle_id": vehicle_ids[3],
            "maintenance_type": "Brake Service",
            "description": "Front and rear brake pad replacement",
            "cost": 12500,
            "maintenance_date": date.today().isoformat(),
            "next_service_date": (date.today() + timedelta(days=180)).isoformat(),
            "status": "Pending",
        },
        {
            "vehicle_id": vehicle_ids[0],
            "maintenance_type": "Oil Change",
            "description": "Engine oil and filter change",
            "cost": 4500,
            "maintenance_date": (date.today() - timedelta(days=30)).isoformat(),
            "next_service_date": (date.today() + timedelta(days=150)).isoformat(),
            "status": "Completed",
        },
    ]
    for record in records:
        db.maintenance.insert_one(record)


def seed_fuel(vehicle_ids, trip_ids):
    logs = [
        {
            "vehicle_id": vehicle_ids[1],
            "trip_id": trip_ids[0],
            "fuel_station": "HP Petrol Pump, Mumbai",
            "fuel_type": "Diesel",
            "quantity": 120,
            "cost_per_liter": 94.5,
            "total_cost": 11340,
            "fuel_date": date.today().isoformat(),
            "odometer": 62100,
        },
        {
            "vehicle_id": vehicle_ids[2],
            "trip_id": trip_ids[2],
            "fuel_station": "Indian Oil, Delhi",
            "fuel_type": "Diesel",
            "quantity": 200,
            "cost_per_liter": 93.2,
            "total_cost": 18640,
            "fuel_date": (date.today() - timedelta(days=3)).isoformat(),
            "odometer": 115400,
        },
    ]
    for log in logs:
        db.fuel_logs.insert_one(log)


def main():
    print("Seeding TransitOps database...")
    clear_collections()
    seed_users()
    vehicle_ids = seed_vehicles()
    driver_ids = seed_drivers()
    trip_ids = seed_trips(vehicle_ids, driver_ids)
    seed_maintenance(vehicle_ids)
    seed_fuel(vehicle_ids, trip_ids)
    print("Done! Login with:")
    print("  fleet@transitops.io / password123  (Fleet Manager)")
    print("  dispatcher@transitops.io / password123  (Dispatcher)")


if __name__ == "__main__":
    main()

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    client.server_info()

    db = client.get_default_database()

    if db is None:
        db = client["TransitOps"]

except Exception:
    client = MongoClient(MONGO_URI)
    db = client["TransitOps"]

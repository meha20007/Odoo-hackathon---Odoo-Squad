import os
from flask import Blueprint, request, session, redirect, url_for, flash, jsonify, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

# 1. MongoDB Connection Setup (with fallback if database/db.py is empty or unavailable)
try:
    from database.db import db

    # Verify db is actually defined
    if db is None:
        raise AttributeError
except (ImportError, AttributeError):
    from pymongo import MongoClient

    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/odoo_hackathon")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        client.server_info()
        # Fallback to default database or odoo_hackathon
        db = client.get_default_database()
        if db is None:
            db = client["odoo_hackathon"]
    except Exception:
        client = MongoClient(MONGO_URI)
        db = client["odoo_hackathon"]

# 2. Teammate User Model Dynamic Integration Setup
# If teammate creates a User model in database.models or models, we dynamically import it.
# Otherwise, we use direct pymongo queries against the 'users' collection.
User = None
for model_path in ["database.models", "models", "models.user"]:
    try:
        module = __import__(model_path, fromlist=["User"])
        User = getattr(module, "User")
        break
    except (ImportError, AttributeError):
        continue


# Fallback helper class representing the expected interface
class UserFallback:
    @staticmethod
    def find_by_email(email):
        return db.users.find_one({"email": email.strip().lower()})

    @staticmethod
    def find_by_id(user_id):
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            return db.users.find_one({"_id": user_id})
        except Exception:
            return None

    @staticmethod
    def create_user(email, password_hash, role="user", name=""):
        user_data = {
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "role": role,
            "name": name
        }
        result = db.users.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data


# Use active User model if available, else fallback
db_user_helper = User if User is not None else UserFallback


# 3. Core Authentication Logic Functions
def hash_password(password):
    """Generates a secure pbkdf2 password hash."""
    return generate_password_hash(password)


def verify_password(stored_hash, password):
    """Checks if the plaintext password matches the stored hash."""
    return check_password_hash(stored_hash, password)


def authenticate_user(email, password):
    """
    Checks credentials and returns user object/dict and error message.
    """
    if not email or not password:
        return None, "Email and password are required."

    # Lookup user
    user = db_user_helper.find_by_email(email)
    if not user:
        return None, "Invalid email or password."

    # Retrieve password hash (handles objects or dictionaries)
    if hasattr(user, "password_hash"):
        password_hash = user.password_hash
    elif isinstance(user, dict):
        password_hash = user.get("password_hash")
    else:
        return None, "Invalid user model format."

    if not password_hash or not verify_password(password_hash, password):
        return None, "Invalid email or password."

    return user, None


# 4. Blueprint Routes
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    """Endpoint for user registration."""
    if request.method == "POST":
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form

        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        name = data.get("name", "")
        role = data.get("role", "user")

        if not email or not password:
            err = "Email and password are required."
            return jsonify({"error": err}) if request.is_json else (
                        flash(err, "danger") or render_template("register.html"))

        if password != confirm_password:
            err = "Passwords do not match."
            return jsonify({"error": err}) if request.is_json else (
                        flash(err, "danger") or render_template("register.html"))

        if db_user_helper.find_by_email(email):
            err = "A user with this email already exists."
            return jsonify({"error": err}) if request.is_json else (
                        flash(err, "danger") or render_template("register.html"))

        # Hash and create
        pwd_hash = hash_password(password)

        # Call teammate's create method if it exists, otherwise use fallback insertion
        if hasattr(db_user_helper, "create_user"):
            new_user = db_user_helper.create_user(email=email, password_hash=pwd_hash, role=role, name=name)
        elif hasattr(db_user_helper, "create") and callable(db_user_helper.create):
            new_user = db_user_helper.create(email=email, password_hash=pwd_hash, role=role, name=name)
        else:
            # Fallback
            new_user = UserFallback.create_user(email=email, password_hash=pwd_hash, role=role, name=name)

        msg = "Registration successful! Please log in."
        return jsonify({"message": msg}) if request.is_json else (
                    flash(msg, "success") or redirect(url_for("auth.login_view")))

    return render_template("register.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login_view():
    """Endpoint for user login."""
    if request.method == "POST":
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form

        email = data.get("email")
        password = data.get("password")

        user, error = authenticate_user(email, password)
        if error:
            return jsonify({"error": error}) if request.is_json else (
                        flash(error, "danger") or render_template("index.html"))

        # Extract attributes dynamically (dicts or classes)
        if hasattr(user, "_id"):
            user_id = str(user._id)
        elif isinstance(user, dict):
            user_id = str(user.get("_id"))
        else:
            user_id = str(user)

        if hasattr(user, "role"):
            role = user.role
        elif isinstance(user, dict):
            role = user.get("role", "user")
        else:
            role = "user"

        if hasattr(user, "email"):
            email_val = user.email
        elif isinstance(user, dict):
            email_val = user.get("email")
        else:
            email_val = ""

        # Set session details
        session.clear()
        session["user_id"] = user_id
        session["user_role"] = role
        session["user_email"] = email_val

        msg = "Login successful!"
        return jsonify({"message": msg}) if request.is_json else (
                    flash(msg, "success") or redirect(url_for("pages.dashboard")))

    return render_template("index.html")


@auth_bp.route("/logout", methods=["GET", "POST"])
def logout_view():
    """Endpoint for user logout."""
    session.clear()
    msg = "You have been logged out."
    return jsonify({"message": msg}) if request.is_json else (
                flash(msg, "info") or redirect(url_for("auth.login_view")))


@auth_bp.route("/api/auth/me", methods=["GET"])
def current_user():
    """Return the logged-in user for frontend clients (e.g. Lovable)."""
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"authenticated": False}), 401

    user = db_user_helper.find_by_id(user_id)
    if not user:
        session.clear()
        return jsonify({"authenticated": False, "error": "Session is invalid."}), 401

    if isinstance(user, dict):
        return jsonify(
            {
                "authenticated": True,
                "user": {
                    "id": str(user.get("_id")),
                    "email": user.get("email"),
                    "name": user.get("name", ""),
                    "role": user.get("role", "user"),
                },
            }
        )

    return jsonify(
        {
            "authenticated": True,
            "user": {
                "id": str(getattr(user, "_id", user_id)),
                "email": getattr(user, "email", ""),
                "name": getattr(user, "name", ""),
                "role": getattr(user, "role", "user"),
            },
        }
    )
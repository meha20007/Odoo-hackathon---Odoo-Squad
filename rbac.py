from functools import wraps
from flask import session, redirect, url_for, flash, abort, request, jsonify
from auth import db_user_helper

def login_required(f):
    """
    Decorator to ensure a user is logged in before accessing a route.
    If the request expects JSON, it returns a 401 response.
    Otherwise, it redirects to the login page.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            if request.path.startswith("/api/") or request.headers.get("Accept") == "application/json":
                return jsonify({"error": "Authentication required."}), 401
            
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("auth.login_view"))
        return f(*args, **kwargs)
    return decorated_function


def role_required(*allowed_roles):
    """
    Decorator to restrict route access to specific roles.
    Checks the user's role in the session, and validates it against the database.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # 1. Verify user is logged in
            if "user_id" not in session:
                if request.path.startswith("/api/") or request.headers.get("Accept") == "application/json":
                    return jsonify({"error": "Authentication required."}), 401
                flash("Please log in to access this page.", "warning")
                return redirect(url_for("auth.login_view"))

            user_id = session.get("user_id")
            user_role = session.get("user_role")

            # 2. Lookup user in DB to verify and ensure the role is up to date
            user = db_user_helper.find_by_id(user_id)
            if not user:
                # Session is stale
                session.clear()
                if request.path.startswith("/api/") or request.headers.get("Accept") == "application/json":
                    return jsonify({"error": "Session is invalid. User account does not exist."}), 401
                flash("Your account could not be verified. Please log in again.", "danger")
                return redirect(url_for("auth.login_view"))

            # Extract role dynamically (supporting dicts and object models)
            actual_role = "user"
            if hasattr(user, "role"):
                actual_role = user.role
            elif isinstance(user, dict):
                actual_role = user.get("role", "user")

            # Keep session and database roles synchronized
            if actual_role != user_role:
                session["user_role"] = actual_role
                user_role = actual_role

            # 3. Check permissions
            if user_role not in allowed_roles:
                if request.path.startswith("/api/") or request.headers.get("Accept") == "application/json":
                    return jsonify({"error": "Unauthorized. Insufficient permissions."}), 403
                
                flash("You do not have permission to access this resource.", "danger")
                # Redirect user to a safe page (like dashboard)
                return redirect(url_for("dashboard_view"))
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

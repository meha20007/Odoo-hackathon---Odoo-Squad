import os

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, session, url_for
from flask_cors import CORS

from auth import auth_bp
from routes.drivers import drivers_bp
from routes.fuel import fuel_bp
from routes.maintenance import maintenance_bp
from routes.reports import reports_bp
from trip import trip_bp
from vehicle import vehicle_bp

load_dotenv()


def _cors_origins():
    defaults = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    extra = os.environ.get("CORS_ALLOWED_ORIGINS", "")
    if extra:
        defaults.extend(origin.strip() for origin in extra.split(",") if origin.strip())
    return defaults


def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("SECRET_KEY", "transitops-dev-secret-change-in-production")

    is_production = os.environ.get("FLASK_ENV") == "production"
    app.config["SESSION_COOKIE_SAMESITE"] = "None" if is_production else "Lax"
    app.config["SESSION_COOKIE_SECURE"] = is_production

    CORS(
        app,
        origins=_cors_origins(),
        supports_credentials=True,
        allow_headers=["Content-Type", "Accept", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(drivers_bp)
    app.register_blueprint(maintenance_bp)
    app.register_blueprint(fuel_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(vehicle_bp, url_prefix="/api/vehicles")
    app.register_blueprint(trip_bp, url_prefix="/api/trips")

    @app.route("/")
    def index():
        if "user_id" in session:
            return redirect(url_for("dashboard_view"))
        return redirect(url_for("auth.login_view"))

    @app.route("/dashboard")
    def dashboard_view():
        if "user_id" not in session:
            return redirect(url_for("auth.login_view"))
        return jsonify({"message": "Dashboard placeholder. Connect frontend KPI widgets here."})

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "TransitOps API"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

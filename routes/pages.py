from flask import Blueprint, render_template

from rbac import login_required

# This blueprint owns every HTML page. It renders templates only — all data
# comes from client-side fetch() calls to the existing JSON blueprints
# (/api/vehicles, /api/trips, /api/drivers, /api/maintenance, /api/fuel,
# /api/reports/*). This keeps the JSON API blueprints unchanged and gives
# every page a single, consistent place to add new routes.

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", active_page="dashboard")


@pages_bp.route("/trips")
@login_required
def trips_page():
    return render_template("trips.html", active_page="trips")


@pages_bp.route("/vehicles")
@login_required
def vehicles_page():
    return render_template("vehicles.html", active_page="vehicles")


@pages_bp.route("/drivers")
@login_required
def drivers_page():
    return render_template("drivers.html", active_page="drivers")


@pages_bp.route("/maintenance")
@login_required
def maintenance_page():
    return render_template("maintenance.html", active_page="maintenance")


@pages_bp.route("/fuel")
@login_required
def fuel_page():
    return render_template("fuel.html", active_page="fuel")
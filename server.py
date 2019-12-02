"""Mealcast Server. """

# TODO func set_api_key

import os
import googlemaps 
from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session, jsonify, abort, url_for
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, User, Meal, Reservation
from twilio.rest import Client
import datetime
import utils

api = googlemaps.Client(key=os.environ["GOOGLE_MAPS_API_KEY"])
twilio_client = Client(
    os.environ["TWILIO_SID"], os.environ["TWILIO_AUTH_TOKEN"])

app = Flask(__name__)
app.secret_key = "ABC"
app.jinja_env.undefined = StrictUndefined

@app.route("/", methods=["GET"])
def index_page():
    return render_template("index.html", api_key=os.environ['GOOGLE_MAPS_API_KEY'], user=None)


@app.route("/meals", methods=["GET"])
def meals():
    # TODO verify arguments
    address = request.args.get('address')
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    return render_template('meals.html', api_key=os.environ['GOOGLE_MAPS_API_KEY'], address=address, lat=lat, lng=lng)


@app.route("/reserve", methods=["POST"])
def submit_reservation():
    meal_id = int(request.form.get('meal_id'))
    # TODO handle null meal_id

    user = utils.get_logged_in_user()
    # TODO handle no user logged in

    success = Reservation.create(twilio_client, meal_id, user)

    print(success)
    if success:
        return redirect("/reservations")
    else:
        return redirect("/")


@app.route("/reservations", methods=["GET"])
def reservations():
    return render_template('reservations.html', api_key=os.environ['GOOGLE_MAPS_API_KEY'])


@app.route("/reserve", methods=["GET"])
def reserve():
    meal_id = request.args.get('meal_id')
    return render_template('reserve.html', api_key=os.environ['GOOGLE_MAPS_API_KEY'])


@app.route("/api/meals", methods=["GET"])
def api_meals():
    guest_address = request.args.get('address')
    guest_lat = float(request.args.get('lat'))
    guest_lng = float(request.args.get('lng'))
    start_time_hour = int(request.args.get("startTimeHour", 0))
    start_time_minutes = int(request.args.get("startTimeMinutes", 0))
    meters = int(request.args.get('meters', 5000))

    start_time = None
    # 0 hour and 0 minutes is a special value that means from right now
    if start_time_hour == 0 and start_time_minutes == 0:
        start_time = datetime.datetime.now(datetime.timezone.utc)
    else:
        start_time = utils.datetime_from_hour_and_minute(
            start_time_hour, start_time_minutes)

    meals = Meal.nearby(meters, guest_lat, guest_lng, start_time)

    return jsonify([meal.serialize() for meal in meals])


@app.route("/api/register_user", methods=["POST"])
def register_user_api():
    first_name = request.form.get('firstName')
    last_name = request.form.get('lastName')
    email = request.form.get('email')
    phone_number = request.form.get('phoneNumber')
    password = request.form.get('password')

    new_user = User.create_new_user(
        first_name, last_name, email, phone_number, password)

    if new_user is None:
        abort(404)

    utils.set_logged_in_user(new_user)

    return jsonify(new_user.serialize())


@app.route("/api/user", methods=["GET"])
def get_user_api():
    user = utils.get_logged_in_user()

    if user is None:
        abort(404)

    return jsonify(user.serialize())


@app.route("/api/logout", methods=["POST"])
def logout_api():
    user = utils.set_logged_in_user(None)
    return "success"


@app.route("/api/login", methods=["POST"])
def login_api():
    email = request.form.get('email')
    password = request.form.get('password')

    user = User.try_login(email, password)

    if user is None:
        abort(404)

    utils.set_logged_in_user(user)

    return jsonify(user.serialize())


@app.route("/api/meal", methods=["GET"])
def meal_api():
    meal_id = request.args.get('meal_id')

    meal = Meal.get_meal_by_id(meal_id)

    if meal is None:
        abort(404)

    return jsonify(meal.serialize())


@app.route("/api/reservations", methods=["GET"])
def reservation_api():
    user = utils.get_logged_in_user()

    # TODO handle no logged in user
    reservation = Reservation.active_reservation_for_user(user)

    if reservation is None:
        abort(404)

    return jsonify(reservation.serialize())

@app.route("/api/meal_events", methods=["GET"])
def meal_events_api():
    user = utils.get_logged_in_user()

    # TODO handle no logged in user
    meal_events = Reservation.get_meal_events_for_host(user)

    if meal_events is None:
        abort(404)

    return jsonify(meal_events)


@app.route("/host", methods=["GET"])
def host():
    return render_template("host.html", api_key=os.environ['GOOGLE_MAPS_API_KEY'])


@app.route("/host", methods=["POST"])
def host_meal_process():
    user = utils.get_logged_in_user()
    name = request.form.get('mealName')
    description = request.form.get('mealDescription')
    pick_up_hour = int(request.form.get('hour'))
    pick_up_minute = int(request.form.get('minute'))
    address = request.form.get('address')
    lat = float(request.form.get('lat'))
    lng = float(request.form.get('lng'))
    servings = int(request.form.get('mealServings'))

    
    pickup_time = utils.datetime_from_hour_and_minute(pick_up_hour, pick_up_minute)

    new_meal = Meal.create_new_meal(user, name, description, pickup_time, address, lat, lng, servings)
    
    return redirect(url_for(".host_meal_details", meal_id=new_meal.meal_id))


@app.route("/host/meal", methods=["GET"])
def host_meal_details():
    return render_template('host_meal_details.html', api_key=os.environ['GOOGLE_MAPS_API_KEY'])

@app.route("/api/host/meal/", methods=["GET"])
def host_meal_api():

    user = utils.get_logged_in_user()
    meal_id = int(request.args.get('meal_id'))

    meal = Meal.get_meal_by_id(meal_id)

    # TODO better error reporting
    if meal is None:
        abort(404)

    # make sure the meal's user ID is the same as the logged in user
    # TODO better error reporting
    if meal.user_id != user.user_id:
        abort(400)

    return jsonify(meal.serialize())

    
if __name__ == "__main__":
    app.debug = True
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')

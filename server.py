"""Mealcast Server. """

import os
from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, User, Meal, Reservation

from utils import get_logged_in_user, set_logged_in_user, temp_get_form_validation

app = Flask(__name__)
app.secret_key = "ABC"
app.jinja_env.undefined = StrictUndefined


@app.route("/", methods=["GET"]) 
def index_page():
    return render_template("index.html", api_key=os.environ['GOOGLE_MAPS_API_KEY'], user=None)

@app.route("/meals", methods=["GET"]) 
def meals(): 
    guest_address = request.args.get('user-address')
    guest_lat = float(request.args.get('lat'))
    guest_lng = float(request.args.get('lng'))
    meters = int(request.args.get('meters', 1000))

    meals = Meal.nearby(meters, guest_lat, guest_lng)
    
    # TODO find meals near guest, display them on meals page 
    # TODO once guest_user selects a meal, redirect to confirmation page
    # return render_template("reserve_meal.html", meals=meals)
    r = "\n".join([m.address for m in meals])
    return r

if __name__ == "__main__":
    app.debug = True
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')
"""Mealcast Server. """

import os
import googlemaps

from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session, jsonify, abort
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, User, Meal, Reservation
#  from utils import get_logged_in_user, set_logged_in_user, temp_get_form_validation
import datetime

api = googlemaps.Client(key=os.environ["GOOGLE_MAPS_API_KEY"])

app = Flask(__name__)
app.secret_key = "ABC"
app.jinja_env.undefined = StrictUndefined


###############################################################################################
#                                       LANDING PAGE                                          #
###############################################################################################


@app.route("/", methods=["GET"]) 
def index_page():
    return render_template("index.html", api_key=os.environ['GOOGLE_MAPS_API_KEY'], user=None)


###############################################################################################
#                                        MEALS PAGE                                           #  
#                   ____                                    ?~~bL                             #
#                   z@~ b                                    |  `U,                           # 
#                    ]@[  |                                   ]'  z@'                         #  
#                    d@~' `|, .__     _----L___----, __, .  _t'   `@j                         #  
#                    `@L_,   "-~ `--"~-a,           `C.  ~""O_    ._`@                        #  
#                    q@~'   ]P       ]@[            `Y=,   `H+z_  `a@                         #  
#                    `@L  _z@        d@               Ya     `-@b,_a'                         #  
#                    `-@d@a'       )@[               `VL      `a@@'                           #  
#                        aa~'   ],  .a@'                qqL  ), ./~                           #  
#                        @@_  _z~  _d@[                 .V@  .L_d'                            #  
#                        "~@@@'  ]@@@'        __      )@n@bza@-"                              #  
#                        `-@zzz@@@L        )@@z     ]@@=%-"                                   #  
#                            "~~@@@@@bz_    _a@@@@z___a@K                                     #  
#                                "~-@@@@@@@@@@@@@@@@@@~"                                      #
#                                    `~~~-@~~-@@~~~~~'                                        #  
###############################################################################################


@app.route("/meals", methods=["GET"]) 
def meals(): 
    # TODO verify arguments
    address = request.args.get('address')
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    
    return render_template('meals.html', api_key=os.environ['GOOGLE_MAPS_API_KEY'], address=address, lat=lat, lng=lng)


###############################################################################################
#                                    API MEALS PROCESS                                       #
###############################################################################################

@app.route("/api/meals", methods=["GET"])
def api_meals(): 
    guest_address = request.args.get('address')
    guest_lat = float(request.args.get('lat'))
    guest_lng = float(request.args.get('lng'))
    start_time_param = request.args.get("startTime", "now")
    meters = int(request.args.get('meters', 5000))

    start_time = None
    if start_time_param == "now":
        start_time = datetime.datetime.now(datetime.timezone.utc)
    else:
        raise NotImplementedError()
        
    meals = Meal.nearby(meters, guest_lat, guest_lng, start_time)
    
    return jsonify([meal.serialize() for meal in meals])


###############################################################################################
#                                     RESERVE PAGE                                            #
###############################################################################################

@app.route("/reserve", methods=["GET"]) 
def reserve(): 
    meal_id = request.args.get('meal_id')
    
    meal = Meal.query.filter_by(meal_id=meal_id).first()
    return render_template('reserve.html', api_key=os.environ['GOOGLE_MAPS_API_KEY'], address=meal.address)

@app.route("/api/register_user", methods=["POST"]) 
def register_user_api(): 
    first_name = request.form.get('firstName')
    last_name = request.form.get('lastName')
    phone_number = request.form.get('phoneNumber')
    password = request.form.get('password')

    new_user = User.create_new_user(first_name, last_name, phone_number, password)

    if new_user is None:
        abort(404)

    return jsonify(new_user.serialize())
    


###############################################################################################
#                                     ____________ PAGE                                       #
###############################################################################################


if __name__ == "__main__":
    app.debug = True
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')
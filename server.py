"""Mealcast Server. """

import os
from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, User, Meal, Reservation

from utils import get_logged_in_user, set_logged_in_user, temp_get_form_validation

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

    guest_address = request.args.get('user-address')
    guest_lat = float(request.args.get('lat'))
    guest_lng = float(request.args.get('lng'))
    meters = int(request.args.get('meters', 100000000)) 

    meals = Meal.nearby(meters, guest_lat, guest_lng)

    return render_template('meals.html', api_key=os.environ['GOOGLE_MAPS_API_KEY'], meals=meals, address=guest_address)


###############################################################################################
#                                    API MEALS PROCESS                                       #
###############################################################################################

@app.route("/api/meals", methods=["GET"])
def api_meals(): 
    guest_address = request.args.get('address')
    guest_lat = float(request.args.get('lat'))
    guest_lng = float(request.args.get('lng'))
    meters = int(request.args.get('meters', 5000))

    meals = Meal.nearby(meters, guest_lat, guest_lng)
    
    return jsonify([meal.serialize() for meal in meals])


###############################################################################################
#                                     RESERVATIONS PAGE                                       #
###############################################################################################

@app.route("/reservations", methods=["GET"])
def reservations(): 

    return render_template('reservations.html')


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
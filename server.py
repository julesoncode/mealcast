"""Mealcast Server. """

import os
from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Meal, Reservation 

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
    guest_lat = request.args.get('lat')
    guest_lng = request.args.get('lng')

    return redirect("/")

    # if guest_address is None:


        #create search bar with autocomplete, add event listener, change meals on the page 

    #else 
    #display top 10 meals, see caviar site for format
    #if no meals, display msg 
    #user can filter by location and meal type 
    

    # return render_template("reserve_a_meal.html", meals=meals, location=user_location)


# @app.route("/logout", methods=["POST"])
# def logout():
#     user = get_logged_in_user()
#     if user is not None:
#         set_logged_in_user(None)

#     return redirect("/")


# @app.route("/login", methods=["GET"])
# def login_form():
#     user = get_logged_in_user() 
#     if user is not None:
#         redirect("/")

#     return render_template("login.html")


# @app.route("/login", methods=["POST"])
# def login_submit():
#     user = get_logged_in_user()
#     if user is not None:
#         return redirect("/")

#     email = request.form["email"]
#     password = request.form["password"]

#     user = User.query.filter_by(email=email, password=password).first()

#     if user is None:
#         flash("Invalid email/password combination, try again!")
#         return redirect("/login")

#     set_logged_in_user(user)

#     return redirect("/")

# @app.route("/host_info", methods=["GET"])
# def host_info_page(): 
#     return render_template("host_info_page.html")

# @app.route("/host_info", methods=["POST"])
# def host_info_page_process(): 
#     user = get_logged_in_user()
#     if user is not None:
#         return render_template("host_dashboard.html")
#     elif user is None: 
#         flash("To get started please sign up or login")
#         return redirect("/login")

# @app.route("/host", methods=["GET"])
# def create_meal_form():
#     user = get_logged_in_user() 
#     if user is  None: 
#         flash("Sorry, you need to login first")
#         return redirect("/")

#     elif user is not None: 
#         return render_template("/create_meal.html")

# @app.route("/host", methods=["POST"])
# def create_meal_process():
   
#     user = get_logged_in_user() 
#     if user is  None: 
#         flash("Sorry, you need to login first")
#         return redirect("/")

#     elif user is not None: 
#         print(user)

#         meal_name = request.form["meal-name"]
#         meal_description = request.form["meal-description"]
#         meal_address = request.form["meal-address"]
#         meal_type = request.form["meal-type"]

#         new_meal = Meal(user_id=user.user_id, 
#             name=meal_name, 
#             description=meal_description,
#             location=meal_address,
#             meal_type=meal_type)

#         db.session.add(new_meal)
#         db.session.commit()

#         flash(f"Your meal has been casted!") 
#         return render_template("host_confirmation.html", new_meal=new_meal)



# @app.route("/meals") 
# def meals():
#     user_location = request.args['user-location']

#     if user_location is None:
#         raise NotImplementedError("TODO handle no location given")

#     meals = Meal.query.all()

#     return render_template("reserve_a_meal.html", meals=meals, location=user_location)

# @app.route("/reserve/<int:meal_id>", methods=["GET"])
# def reserve(meal_id):
#     meal = Meal.query.filter_by(meal_id=meal_id).first()

#     session["host_id"] = meal.user_id 


#     if meal is None:
#         flash("Invalid reservation credentials, try again!")
#         return redirect("/")
#         # OLD: raise NotImplementedError("handle bad meal id")

#     user = get_logged_in_user()

#     return render_template("reserve.html", user=user, meal=meal)


# @app.route("/reserve/<int:meal_id>", methods=["POST"])
# def reserve_submit(meal_id):

#     meal = Meal.query.filter_by(meal_id=meal_id).first()

#     if meal is None:
#         # TODO handle bad meal id
#         raise NotImplementedError("handle bad meal id")

#     user = get_logged_in_user()

#     if user is None:
#             first_name = request.form["first-name"]
#             last_name = request.form["last-name"]
#             email = request.form["email"]
#             password = request.form["password"]

#             form_validation = temp_get_form_validation(first_name,
#                                                         last_name, 
#                                                         email, 
#                                                         password)
#             print(form_validation)
#             if form_validation: 

#                 user = User(first_name=first_name, last_name=last_name, email=email, password=password)

#                 db.session.add(user)
#                 db.session.commit()
        
#                 # TODO handle user add failure
#                 set_logged_in_user(user)

#             else: 
#                 flash(f"""The credentials you supplied were not correct or did 
#                             not grant access to this resource, try again!""")
#                 return redirect("/")

#     # TODO add reservations
#     reservation_id = 123
#     return redirect(f"/reservation/{reservation_id}")

  
# @app.route("/reservation/<int:reservation_id>")
# def reservation(reservation_id):
#     user = get_logged_in_user()
#     if user is None:
#         redirect("/")

#     host_id = session["host_id"] 

#     host_meal = Meal.query.filter_by(user_id=host_id).first() 
#     print(host_meal)





#     # TODO fetch and validate reservation belongs to user from db after model change.

#     return render_template("reservation.html", user=user, reservation=reservation_id, host_meal=host_meal)


# OLD ===============================================================
# def check_login():
#     # if the user exists, return the user, otherwise return None
#     if "email" in session:
#         current_user_email = session["email"]
#         current_user = User.query.filter_by(email=current_user_email).first()
#         if not current_user:
#             # TODO test this
#             session.delete(current_user) 
#         return current_user



# @app.route("/") 
# def landing_page_process():
# # def login():
#     email = request.form["email"] # get form variables
#     password = request.form["password"]

#     # BUG: this logins in the user, but we haven't checked for a valid password yet!
#     session["email"] = email 
#     session["password"] = password

#     user = User.query.filter_by(email=email).first()  
  
#     if not user:
#         flash("Invalid credentials") # add flash msgs to jinja 
#         return redirect("/register") 
#     print(user.password)
#     if user.password != password:
#         flash("Incorrect password")
#         return redirect("/")

#     return redirect("/host-or-guest") 


# @app.route("/register", methods=["GET"])
# def registration_form():

#     return render_template("register_form.html")  


# @app.route("/register", methods=["POST"])
# def register_process():
 
#     first_name = request.form["first_name"]
#     last_name = request.form["last_name"]
#     email = request.form["email"]
#     password = request.form["password"]

#     new_user = User(first_name=first_name, # Adds new user to the db
#                     last_name=last_name, 
#                     email=email, 
#                     password=password)

#     db.session.add(new_user)
#     db.session.commit()

#     flash(f"User {email} added.") # Add to jinja
#     return redirect("/host-or-guest")

 
# @app.route("/host-or-guest", methods=['GET'])
# def host_or_guest_form(): 
#     # BUG: is the user logged in at all?

#     return render_template('host_or_guest.html') # user dashboard 


# @app.route("/host-or-guest", methods=["POST"])
# def host_guest_process(): 

#     choice = request.form.get("user-mode")

#     if choice == "host":
#         return redirect("/create-meal") 

#     elif choice == "guest":
#         return redirect("/find-meal")


# @app.route("/create-meal", methods=["GET"])
# def create_meal_form():
#     user = check_login()
#     if not user:
#         return redirect("/")

#     return render_template("/create_meal.html")


# @app.route("/create-meal", methods=["POST"])
# def create_meal_process():
#     current_user = check_login()
#     if not current_user:
#         return 

#     meal_name = request.form["meal-name"]
#     meal_description = request.form["meal-description"]
#     meal_address = request.form["meal-address"]
#     meal_type = request.form["meal-type"]

#     new_meal = Meal(user_id=current_user.user_id, 
#         name=meal_name, 
#         description=meal_description,
#         location=meal_address,
#         meal_type=meal_type)

#     session["meal_address"] = meal_address 


#     db.session.add(new_meal)
#     db.session.commit()

#     flash(f"You're meal has been casted!") #2.0: redirect user to confirmation page(?)
#     return redirect("/host-or-guest")


# @app.route("/find-meal", methods=["GET"])
# def find_meal_form():
    
#     return render_template("find_meal.html") 


# @app.route("/find-meal", methods=["POST"])
# def find_meal_process(): #2.0: geocoding 

#     print(session) # test

#     guest_address = request.form["guest-address"]
#     the_meal = Meal.query.filter_by(location=guest_address).one()
#     meals = Meal.query.all() # TODO pass to jinja
#     print(the_meal) # test


#     return render_template('meal_match_page.html', the_meal=the_meal) 

if __name__ == "__main__":
    app.debug = True
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')
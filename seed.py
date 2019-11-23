import datetime
from sqlalchemy import func
from model import User, Meal, Reservation, connect_to_db, db

# def load_users(user_filename):

#     for i, row in enumerate(open(user_filename)):
#         row = row.rstrip() 
        
#         user_id, first_name, last_name, email, password, address, profile_picture = row.split("|") 

#         user = User(user_id=user_id, 
#                     first_name=first_name, 
#                     last_name=last_name,
#                     email=email, 
#                     password=password
#                     address=address
#                     profile_picture=profile_picture)

#         user_id = int(user_id)

#         db.session.add(user)

#         db.session.commit()


# def load_meals(meal_filename):

#     # TODO: func that randomluy assigns a user_id to a meal
#     users = User.query.all() 

#     rand_user_id = 

#     for i, row in enumerate(open(meal_filename)):
#         row = row.rstrip()

#         name, meal_type, description, start_time, end_time, 
#         lat, lng, servings = row.split("|") 

#         meal = Meal(meal_id=meal_id, 
#                     user_id=user.user_id, 
#                     name=name, 
#                     meal_type=meal_type, 
#                     description=description, 
#                     start_time=start_time,  
#                     end_time=end_time, 
#                     geo=geo
#                     servings=servings)

#         meal_id = int(meal_id)
#         user_id = int(user_id)
#         geo = f"POINT(lat, lng)"

#         db.session.add(meal)
#         db.session.commit()


# def load_reservations(reservation_filename):

#     for i, row in enumerate(open(reservation_filename)):
#         row = row.rstrip() 

#         reservation_id, meal_id, guest_user = row.split("|") 

#         reservation = Reservation( reservation_id=reservation_id,
#                                 meal_id=meal_id, 
#                                 guest_user_id=guest_user_id)

#         reservation_id = int(reservation_id)
#         meal_id = int(meal_id)
#         guest_user_id = int(guest_user_id)

#         db.session.add(user)
#         db.session.commit()

# def set_val_user_id():
#     """Set value for the next user_id after seeding database"""

#     # Get the Max user_id in the database
#     result = db.session.query(func.max(User.user_id)).one()
#     max_id = int(result[0])

#     # Set the value for the next user_id to be max_id + 1
#     query = "SELECT setval('users_user_id_seq', :new_id)"
#     db.session.execute(query, {'new_id': max_id + 1})
#     db.session.commit()

def load_meals2():
    pass
    #meal_1 = Meal(meal_id=1, user_id=2, meal_type='dinein', name='hells kictchen eggs', description="scrambled eggs mmm", address='225 Ellis St, San Francisco, CA, 94102', geo=, servings=5)

    #meal_2 =  Meal(meal_id=1, user_id=2, meal_type='dinein', name='other egg thing', description="eggs mmm", address='1245 S Van Ness Ave, San Francisco, CA 94110', geo=, servings=5)



if __name__ == "__main__":
    from server import app
    connect_to_db(app)
    db.create_all()

    #load_meals2()

    # user_filename = "seed_data/user_data"
    # meal_filename="seed_data/meal_data"
    # reservation_filename="seed_data/reservation_data"

    # load_users(user_filename)
    # set_val_user_id()
    # load_meals(meal_filename)
    # load_reservations(reservation_filename)
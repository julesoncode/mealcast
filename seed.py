import datetime
from sqlalchemy import func
from model import User, Meal, connect_to_db, db
from model import app

def load_users(user_filename):

    for i, row in enumerate(open(user_filename)):
        row = row.rstrip() 

        user_id, first_name, last_name, email, password = row.split("|") 

        user = User(user_id=user_id, 
                    first_name=first_name, 
                    last_name=last_name,
                    email=email, 
                    password=password)

        user_id = int(user_id)

        db.session.add(user)

        db.session.commit()


def load_meals(meal_filename):

    for i, row in enumerate(open(user_filename)):
        row = row.rstrip() 

        meal_id, user_id, name, description, start_time, end_time, location,
        longitude, latitude, media_type_id= row.split("|") 

        meal = Meal(meal_id=meal_id, 
                    user_id=user_id, 
                    name=name, 
                    description=description, 
                    start_time=start_time,  
                    end_time=end_time, 
                    location=location, 
                    longitude=longitude, 
                    latitude=latitude, 
                    meal_type_id=meal_type_id)


        meal_id = int(meal_id)
        user_id = int(user_id)
        longitude = float(longitude)
        latitude = float(latitude)


        db.session.add(user)

        db.session.commit()

def load_meal_media(meal_media_filename):

    for i, row in enumerate(open(user_filename)):
        row = row.rstrip() 

        meal_media_id, meal_id, media = row.split("|") 

        meal_media = mealMedia( meal_media_id=meal_media_id,
                                meal_id=meal_id, 
                                media=media)

        meal_media_id = int(meal_media_id)
        meal_id = int(meal_id)
      


        db.session.add(user)
        db.session.commit()

def load_meal_type(meal_type_filename): 

    for i, row in enumerate(open(user_filename)):
        row = row.rstrip() 

        meal_type_id, title = row.split("|") 

        meal_type = mealType(meal_type_id=meal_type_id, title=title)
        meal_type_id = int(meal_type_id)


        db.session.add(meal_type)
        db.session.commit()

def set_val_user_id():
    """Set value for the next user_id after seeding database"""

    # Get the Max user_id in the database
    result = db.session.query(func.max(User.user_id)).one()
    max_id = int(result[0])

    # Set the value for the next user_id to be max_id + 1
    query = "SELECT setval('users_user_id_seq', :new_id)"
    db.session.execute(query, {'new_id': max_id + 1})
    db.session.commit()

if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()

    user_filename = "seed_data/user_data"

    # load_users(user_filename)
    # set_val_user_id()
    # load_meals(meal_filename)
    # load_meal_media(meal_media_filename)
    # load_meal_type(meal_type_filename)


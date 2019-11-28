"""Models and database functions for Mealcast project."""
from flask import Flask

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy import PrimaryKeyConstraint, func
from geoalchemy2 import Geography, WKTElement

from datetime import datetime 
import pytz

PST = pytz.timezone('US/Pacific')

db = SQLAlchemy()

class User(db.Model):

    __tablename__ = "users"

    user_id = db.Column(db.Integer(), autoincrement=True,
                        primary_key=True)
    first_name = db.Column(db.String(), nullable=False)
    last_name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)
    address = db.Column(db.String(), nullable=True)


    def __repr__(self):

        return f""""<user_id={self.user_id} 
                    first_name={self.first_name} 
                    last_name={self.last_name}
                    email={self.email}
                    password={self.password}
                    address={self.address}
                    profile_picture{profile_picture}>"""


    @staticmethod
    def create_new_user(first_name, last_name, phone_number, password):
        try:
            result = User(first_name=first_name,
                    last_name=last_name, 
                    email=phone_number, # TODO fix this once we change model to phone number
                    password=password)

            db.session.add(result)
            db.session.commit()
            
            return result
        except Exception as e:
            print(e)
            return None

    @staticmethod
    def try_login(phone_number, password):
        try:
            return User.query.filter_by(email=phone_number, password=password).one()
        except Exception as e:
            print(e)
            return None

    def serialize(self):
        return {
            "userID": self.user_id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "phoneNumber": self.email,
        }
    

class Meal(db.Model):

    __tablename__ = "meals"

    meal_id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.user_id'),
                        nullable=False)
    meal_type= db.Column(db.String(), nullable=False) 

    name = db.Column(db.String(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    start_time = db.Column(db.DateTime(), default = datetime.utcnow(), nullable=False)
    end_time = db.Column(db.DateTime(), default = datetime.utcnow(), nullable=False)
    address = db.Column(db.String(), nullable=False)
    geo = db.Column(Geography(geometry_type='POINT'))
    servings = db.Column(db.Integer(), nullable=False)

    user = relationship("User")

    def __repr__(self):

        return f"""<meal_id={self.meal_id}, 
                    user_id={self.user_id}
                    meal_type={self.meal_type} 
                    name={self.name} 
                    description={self.description} 
                    start_time={self.start_time}
                    end_time={self.end_time} 
                    address={self.address} 
                    geo={self.geo}
                    servings={self.servings}>"""


    def serialize(self):
        return {
            'meal_id': self.meal_id,
            "name": self.name,
            "address": self.address,
            "start_time": self.start_time.timestamp(),
            "end_time": self.end_time.timestamp()
        }


    @classmethod
    def nearby(cls, meters, lat, lng, start_time):
        loc = WKTElement("POINT(%0.8f %0.8f)" % (lat, lng)) 
        meals = Meal.query.filter(func.ST_Distance(loc, Meal.geo) <= meters) \
            .filter(Meal.start_time >= start_time) \
            .filter(Meal.end_time <= utils.closing_datetime()) \
            .order_by(func.ST_Distance(loc, Meal.geo) <= meters)

        return meals.limit(20).all()


class Reservation(db.Model): 

    __tablename__ = "reservations"

    reservation_id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    meal_id = db.Column(db.Integer(), db.ForeignKey('meals.meal_id'), nullable=False)
    guest_user_id = db.Column(db.Integer(), db.ForeignKey('users.user_id'), nullable=False)

    def __repr__(self):

        return f"""<meal_type={self.meal_type}
                    meal_id={self.meal_id}, 
                    guest_user_id={self.user_id}>"""

    user = relationship("User")

def connect_to_db(app):
    """Connect the database to Flask app."""

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///mealcast'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


def opening_datetime():
    now = datetime.datetime.now(PST)
    return now.replace(hour=8, minute=0, second=0, microsecond=0)

def closing_datetime():
    now = datetime.datetime.now(PST)
    return now.replace(hour=23, minute=0, second=0, microsecond=0)


if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    db.create_all()

    print("Connected to DB.")
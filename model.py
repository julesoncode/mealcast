"""Models and database functions for Mealcast project."""
from flask import Flask

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy import PrimaryKeyConstraint
from geoalchemy2 import Geography

from datetime import datetime 

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


if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    db.create_all()

    print("Connected to DB.")
"""Models and database functions for Mealcast project."""
from flask import Flask

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy import PrimaryKeyConstraint, func
from geoalchemy2 import Geography, WKTElement
from geoalchemy2.shape import to_shape
from datetime import datetime
import pytz

PST = pytz.timezone('America/Los_Angeles')
UTC = pytz.timezone('UTC')

db = SQLAlchemy()


class User(db.Model):

    __tablename__ = "users"

    user_id = db.Column(db.Integer(), autoincrement=True,
                        primary_key=True)
    first_name = db.Column(db.String(), nullable=False)
    last_name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    phone_number = db.Column(db.String(), nullable=False, unique=False)
    password = db.Column(db.String(), nullable=False)
    address = db.Column(db.String(), nullable=True)

    def __repr__(self):

        return f""""<user_id={self.user_id} 
                    first_name={self.first_name} 
                    last_name={self.last_name}
                    phone_number={self.phone_number}
                    password={self.password}
                    address={self.address}>"""

    @staticmethod
    def create_new_user(first_name, last_name, email, phone_number, password):
        try:
            maybe_user_with_phone_number = User.query.filter_by(phone_number=phone_number).first()

            if maybe_user_with_phone_number is not None:
                return "Phone number already in use"
            
            result = User(first_name=first_name,
                          last_name=last_name,
                          email=email,
                          phone_number=phone_number,
                          password=password)

            db.session.add(result)
            db.session.commit()

            return result
        except Exception as e:
            exception_str = str(e)
            if "users_email_key" in exception_str:
                return "Email already in use"
            else:
                return "Something bad has happened"

    @staticmethod
    def try_login(email, password):
        try:
            return User.query.filter_by(email=email, password=password).one()
        except Exception:
                return None

    def serialize(self):
        return {
            "userID": self.user_id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "phoneNumber": self.phone_number,
        }


class Meal(db.Model):

    __tablename__ = "meals"

    meal_id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey(
        'users.user_id'), nullable=False)
    name = db.Column(db.String(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    pickup_time = db.Column(db.DateTime(), nullable=False)
    # TODO change var name to pickup_address
    address = db.Column(db.String(), nullable=False)
    geo = db.Column(Geography(geometry_type='POINT'))
    servings = db.Column(db.Integer(), nullable=False)
    picture_url = db.Column(db.String(), nullable=True)

    user = relationship("User")
    reservations = relationship("Reservation")

    def __repr__(self):

        return f"""<meal_id={self.meal_id}, 
                    user_id={self.user_id}
                    name={self.name} 
                    description={self.description} 
                    pickup_time={self.start_time}
                    address={self.address} 
                    geo={self.geo}
                    servings={self.servings}>"""

    def serialize(self):
        serialized_reservations = [r.serialize() for r in self.reservations]
        # we use shapely to get the lat/long data from the opaque postgres geo type
        shape = to_shape(self.geo)
        serialized = {
            'meal_id': self.meal_id,
            "name": self.name,
            "address": self.address,
            "pickupTime": self.pickup_time.timestamp(),
            "servings": self.servings,
            "lat": shape.y,
            "lng": shape.x,
            "picture_url": self.picture_url,
            "reservations": serialized_reservations,
            "distance": 5000,
        }

        if self.picture_url is not None:
            serialized["pictureURL"] = self.picture_url

        return serialized

    @staticmethod
    def create_new_meal(user, name, description, pickup_time, address, lat, lng, servings, picture_url):
        try:
            result = Meal(user_id=user.user_id,
                          name=name,
                          description=description,
                          pickup_time=pickup_time,
                          address=address,
                          geo="POINT(%0.8f %0.8f)" % (lng, lat),
                          servings=servings,
                          picture_url=picture_url)

            db.session.add(result)
            db.session.commit()
            return result

        except Exception as e:
            print(e)
            return None

    @staticmethod
    def nearby(meters, lat, lng, start_time):
        loc = WKTElement("POINT(%0.8f %0.8f)" % (lng, lat))
        meals = Meal.query.filter(func.ST_Distance(loc, Meal.geo) <= meters) \
            .filter(Meal.pickup_time >= start_time) \
            .filter(Meal.pickup_time <= closing_datetime()) \
            .order_by(Meal.pickup_time)

        return meals.limit(20).all()

    @staticmethod
    def get_meal_by_id(meal_id):
        try:
            return Meal.query.filter_by(meal_id=meal_id).one()
        except Exception as e:
            print(e)
            return None

    @staticmethod
    def has_more_servings(meal_id):
        try:
            count = db.session.query(func.count(Reservation.meal_id)).filter_by(
                meal_id=meal_id).scalar()
            return Meal.query.filter_by(meal_id=meal_id).filter(Meal.servings > count).first() != None
        except Exception as e:
            print(e)
            return False


class Reservation(db.Model):

    __tablename__ = "reservations"

    reservation_id = db.Column(
        db.Integer(), autoincrement=True, primary_key=True)
    meal_id = db.Column(db.Integer(), db.ForeignKey(
        'meals.meal_id'), nullable=False)
    guest_user_id = db.Column(db.Integer(), db.ForeignKey(
        'users.user_id'), nullable=False)

    user = relationship("User")
    meal = relationship("Meal")

    def __repr__(self):

        return f"""<reservation_id={self.reservation_id}
                    meal_id={self.meal_id},
                    guest_user_id={self.guest_user_id}>"""

    def serialize(self):
        return {
            "reservation_id": self.reservation_id,
            "user": self.user.serialize(),
            "meal_id": self.meal.meal_id,
        }

    @staticmethod
    def create(twilio_client, meal_id, user):
        try:
            maybe_reservation = Reservation.active_reservation_for_user(user)

            if maybe_reservation is not None:
                # reservation already exists for this meal and user
                # TODO show a nicer error
                return False

            if not Meal.has_more_servings(meal_id):
                # we went over capacity
                # TODO show a nicer error
                return False

            # get the host from the meal, we need their phone number for twilio
            host = db.session.query(User).join(Meal) \
                .filter(Meal.meal_id == meal_id).one()

            reservation = Reservation(
                meal_id=meal_id, guest_user_id=user.user_id)
            db.session.add(reservation)
            db.session.commit()

            twilio_client.messages.create(
                body=f'New Reservation: http://0.0.0.0:5000/meal/meal_id={meal_id}',
                from_='+14154231357',
                to=host.phone_number)

            return True
        except Exception as e:
            print(e)
            return False

    @staticmethod
    def active_reservation_for_user(user):
        try:
            # A user can only make one reservation per day
            # This query tries to find any reservations made within today's time range
            return db.session.query(Meal).join(Reservation) \
                .filter(Reservation.guest_user_id == user.user_id) \
                .filter(Meal.pickup_time >= opening_datetime()) \
                .filter(Meal.pickup_time <= closing_datetime()).first()
        except Exception as e:
            print(e)
            return None

    @staticmethod
    def get_meal_events_for_host(user):
        upcoming_meal_events = Meal.query.filter_by(user_id=user.user_id).filter(
            Meal.pickup_time >= datetime.now(UTC)).all()
        upcoming_meal_events = [m.serialize() for m in upcoming_meal_events]

        previous_meal_events = Meal.query.filter_by(user_id=user.user_id).filter(
            Meal.pickup_time < datetime.now(UTC)).all()
        previous_meal_events = [m.serialize() for m in previous_meal_events]

        return {
            "upcoming_meal_events": upcoming_meal_events,
            "previous_meal_events": previous_meal_events,
        }


def connect_to_db(app):
    """Connect the database to Flask app."""

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///mealcast'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


def opening_datetime():
    now = PST.normalize(datetime.now(UTC))
    return UTC.normalize(now.replace(hour=8, minute=0, second=0, microsecond=0))


def closing_datetime():
    now = PST.normalize(datetime.now(UTC))
    return UTC.normalize(now.replace(hour=23, minute=0, second=0, microsecond=0))


if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    db.create_all()

    print("Connected to DB.")

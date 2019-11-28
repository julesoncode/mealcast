from flask import Flask, render_template, request, flash, redirect, session
from model import User

def set_logged_in_user(user):
    if user is None:
        session["logged-in-user-id"] = None
    else:    
        session["logged-in-user-id"] = user.user_id

def get_logged_in_user():
    user_id = session.get("logged-in-user-id")

    if user_id is None:
        return None

    try:
        return User.query.filter_by(user_id=user_id).first()
    except Exception as e:
        print(e)
        return None

def temp_get_form_validation(first_name, last_name, email, password):
    validation = False
    form_vars = [first_name, last_name, email, password]

    for form_var in form_vars: 
        if form_var.isalpha() and (len(form_var) > 4 and len(form_var) <= 25):

            validation = True
    # BUG: returns boolean, instead of validator information 
    return validation


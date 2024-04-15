from flask_wtf import FlaskForm
from wtforms import (
    StringField, SubmitField,
    PasswordField, EmailField
)


class RegiserForm(FlaskForm):
    username = StringField('Username')
    password = PasswordField('Password')
    email = EmailField('Email')
    submit = SubmitField('Sign Up')

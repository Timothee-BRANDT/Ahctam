import re
from flask_wtf import FlaskForm
from wtforms import (
    StringField, SubmitField,
    PasswordField, EmailField
)


class RegisterForm(FlaskForm):
    username = StringField('Username')
    password = PasswordField('Password')
    email = EmailField('Email')
    submit = SubmitField('Sign Up')

    def validate_username(self, field):
        if len(field.data) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(field.data) > 20:
            raise ValueError('Username must be less than 20 characters long')

    def validate_password(self, field):
        if len(field.data) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(field.data) > 20:
            raise ValueError('Password must be less than 20 characters long')

    def validate_email(self, field):
        regex = r'^\w+@\w+\.\w+$'
        if not re.match(regex, field.data):
            raise ValueError('Invalid email address')

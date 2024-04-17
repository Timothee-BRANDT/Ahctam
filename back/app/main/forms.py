import re
from flask_wtf import FlaskForm
from wtforms import (
    StringField, SubmitField,
    PasswordField, EmailField,
)
from ..database import get_db_connection


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
        query = 'SELECT * FROM users WHERE username = %s'
        # The comma is mandatory to make it a tuple, expected by psycopg2
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(query, (field.data,))
            user = cur.fetchone()
        except Exception as e:
            raise ValueError(f"An error occurred: {e}")
        else:
            if user:
                raise ValueError('Username already exists')
        finally:
            cur.close()
            conn.close()

    def validate_password(self, field):
        regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$'
        if not re.match(regex, field.data):
            raise ValueError("""
                Password must contain at least 1 lowercase letter,
                1 uppercase letter, 1 digit, 1 special character
                and be between 8 and 20 characters long
            """)

    def validate_email(self, field):
        regex = r'^\w+@\w+\.\w+$'
        if not re.match(regex, field.data):
            raise ValueError('Invalid email address')
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute('SELECT * FROM users WHERE email = %s', (field.data,))
            user = cur.fetchone()
        except Exception as e:
            raise ValueError(f"An error occurred: {e}")
        else:
            if user:
                raise ValueError('Email already exists')
        finally:
            cur.close()
            conn.close()

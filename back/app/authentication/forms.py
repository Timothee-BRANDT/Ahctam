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
    password2 = PasswordField('Confirm Password')
    email = EmailField('Email')
    submit = SubmitField('Sign Up')

    def validate_username(self, field):
        if len(field.data) < 3:
            raise ValueError("""
Username must be at least 3 characters long
            """)
        if len(field.data) > 20:
            raise ValueError("""
Username must be less than 20 characters long
            """)

        query = 'SELECT * FROM users WHERE username = %s'
        conn = get_db_connection()
        cur = conn.cursor()
        try:
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
        regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^[\]])[A-Za-z\d@$!%*?&^\[\]]{8,20}$'
        if not re.match(regex, field.data):
            raise ValueError("""
Password must be between 8 and 20 characters long,
contain at least one uppercase letter, one lowercase letter,
one digit and one special character
            """)
        if field.data != self.password2.data:
            raise ValueError('Passwords do not match')

    def validate_email(self, field):
        regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(regex, field.data):
            raise ValueError('Invalid email address')

        query = 'SELECT * FROM users WHERE email = %s'
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(query, (field.data,))
            user = cur.fetchone()
        except Exception as e:
            raise ValueError(f"An error occurred: {e}")
        else:
            if user:
                raise ValueError('Email already exists')
        finally:
            cur.close()
            conn.close()


class LoginForm(FlaskForm):
    username = StringField('Username')
    password = PasswordField('Password')
    submit = SubmitField('Login')

    def validate_username(self, field):
        query = 'SELECT * FROM users WHERE username = %s'
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(query, (field.data,))
            user = cur.fetchone()
        except Exception as e:
            raise ValueError(f"An error occurred: {e}")
        else:
            if not user:
                raise ValueError('Invalid username')
        finally:
            cur.close()
            conn.close()


class ResetPasswordForm(FlaskForm):
    password = PasswordField('Password')
    password2 = PasswordField('Confirm Password')
    submit = SubmitField('Reset Password')

    def validate_password(self, field):
        regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^[\]])[A-Za-z\d@$!%*?&^\[\]]{8,20}$'
        if not re.match(regex, field.data):
            raise ValueError("""
Password must be between 8 and 20 characters long,
contain at least one uppercase letter, one lowercase letter,
one digit and one special character
            """)
        if field.data != self.password2.data:
            raise ValueError('Passwords do not match')

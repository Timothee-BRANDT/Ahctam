import re
from flask_wtf import FlaskForm
from wtforms import (
    Form,
    StringField,
    FieldList,
    SubmitField,
    PasswordField,
    EmailField,
    FileField,
    TextAreaField,
    SelectField,
    SelectMultipleField,
)
from werkzeug.security import check_password_hash
from ..database import get_db_connection


class RegisterForm(FlaskForm):
    username = StringField('Username')
    password = PasswordField('Password')
    password2 = PasswordField('Confirm Password')
    email = EmailField('Email')
    firstname = StringField('First Name')
    lastname = StringField('Last Name')
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

    def validate_firstname(self, field):
        if len(field.data) < 2:
            raise ValueError("""
First name must be at least 2 characters long
            """)
        if len(field.data) > 20:
            raise ValueError("""
First name must be less than 20 characters long
            """)
        if not field.data.isalpha():
            raise ValueError('First name must contain only letters')

    def validate_lastname(self, field):
        if len(field.data) < 2:
            raise ValueError("""
Last name must be at least 2 characters long
            """)
        if len(field.data) > 20:
            raise ValueError("""
Last name must be less than 20 characters long
            """)
        if not field.data.isalpha():
            raise ValueError('Last name must contain only letters')


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

    def validate_password(self, field):
        query = 'SELECT password FROM users WHERE username = %s'
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(query, (self.username.data,))
            user = cur.fetchone()
        except Exception as e:
            raise ValueError(f"An error occurred: {e}")
        else:
            if not check_password_hash(user[0], field.data):
                raise ValueError('Invalid password')
        finally:
            cur.close()
            conn.close()


class ResetPasswordForm(FlaskForm):
    password = PasswordField('Password')
    password2 = PasswordField('Confirm Password')
    submit = SubmitField('Reset Password')

    def validate_password(self, field):
        regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^.\[\]])[A-Za-z\d@$!%*?&^.\[\]]{8,20}$'
        if not re.match(regex, field.data):
            raise ValueError("""
Password must be between 8 and 20 characters long,
contain at least one uppercase letter, one lowercase letter,
one digit and one special character
            """)
        if field.data != self.password2.data:
            raise ValueError('Passwords do not match')


class InformationsForm(Form):
    age = StringField('Age')
    firstname = StringField('First Name')
    lastname = StringField('Last Name')
    email = EmailField('Email')
    gender = StringField('Gender')
    sexualPreference = StringField('Sexual Preferences')
    biography = TextAreaField('Biography')
    photos = FieldList(StringField('Pictures'))
    interests = FieldList(StringField('Interests'))
    location = StringField('Can we use your location?')
    submit = StringField('Submit')

    def validate_gender(self, field):
        if not field.data:
            raise ValueError("""
Please select a gender
            """)

    def validate_sexual_preferences(self, field):
        if not field.data:
            raise ValueError("""
Please select at least one sexual preference
            """)

    def validate_pictures(self, field):
        if len(field.data) > 6:
            raise ValueError('You can upload up to 6 pictures')

    def validate_email(self, field):
        if field.data == self.email.data:
            return
        if not field.data:
            raise ValueError('Please provide an email address')
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

    def validate_firstname(self, field):
        if self.firstname.data == field.data:
            return
        if len(field.data) < 2:
            raise ValueError("""
First name must be at least 2 characters long
            """)
        if len(field.data) > 20:
            raise ValueError("""
First name must be less than 20 characters long
            """)
        if not field.data.isalpha():
            raise ValueError('First name must contain only letters')

    def validate_lastname(self, field):
        if self.lastname.data == field.data:
            return
        if len(field.data) < 2:
            raise ValueError("""
Last name must be at least 2 characters long
            """)
        if len(field.data) > 20:
            raise ValueError("""
Last name must be less than 20 characters long
            """)
        if not field.data.isalpha():
            raise ValueError('Last name must contain only letters')

import re
from flask import (
    current_app,
    url_for,
    render_template,
    jsonify,
)
import psycopg2
from logger import logger
from typing import List, Dict, Tuple
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer
import requests


def send_confirmation_email(email, token):
    with current_app.app_context():
        confirm_url = url_for('auth.confirm_email',
                              token=token, _external=True)
        mail = current_app.extensions['mail']
        msg = Message(
            subject='Matcha . Confirm your email',
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email],
            html=render_template('email_confirmation.html',
                                 confirm_url=confirm_url)
        )
        mail.send(msg)


def send_reset_password_email(email):
    with current_app.app_context():
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        token = serializer.dumps(
            email, salt=current_app.config['SMTP_SECURITY_SALT'])
        mail = current_app.extensions['mail']
        msg = Message(
            subject='Matcha . Reset your password',
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email])
        link = url_for('auth.reset_password_page', token=token, _external=True)
        msg.body = f"""
        To reset your password, visit the following link:
        {link}
        If you did not make this request then simply ignore this email.
        """
        mail.send(msg)
        print('Email sent')


def store_first_login_informations(
    conn: psycopg2.extensions.connection,
    cur: psycopg2.extensions.cursor,
    form: Dict,
    user_id: int,
    user_ip: str
):
    """
    """
    try:
        # User
        user_query = """
UPDATE users
SET age = %s, \
gender = %s, \
sexual_preferences = %s, \
biography = %s \
WHERE id = %s
        """
        cur.execute(
            user_query,
            (
                int(form.age.data),
                form.gender.data,
                form.sexual_preferences.data,
                form.biography.data,
                user_id
            )
        )

        # Pictures
        picture_query = """
INSERT INTO pictures (url, owner)
VALUES (%s, %s)
        """
        profile_picture_query = """
UPDATE pictures
SET is_profile_picture = TRUE
WHERE url = %s AND owner = %s
        """
        raw_photos: List = form.photos.data
        photos: List = [photo for photo in raw_photos if photo]
        for photo in photos:
            cur.execute(picture_query, (photo, user_id))
        cur.execute(profile_picture_query, (photos[0], user_id))

        # Interests
        interests: List = form.interests.data
        interests_query = """
SELECT id FROM interests WHERE name = %s
        """
        for interest in interests:
            cur.execute(interests_query, (interest,))
            interest_id = cur.fetchone()['id']
            user_interest_query = """
INSERT INTO user_interests (user_id, interest_id)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
            """
            cur.execute(user_interest_query, (user_id, interest_id))

        # Location
        location: List = form.location.data
        latitude: float = location[0]
        longitude: float = location[1]
        address: str = ''
        town: str
        if latitude != 0 and longitude != 0:
            logger.info('Using location provided by user')
            town, address = _get_location_from_coordinates(latitude, longitude)
        else:
            # NOTE: Implement it after nginx is set up
            logger.info('No location provided, getting location from ip')
            longitude, latitude, town = _get_location_from_ip(user_ip)
            address = town

        location_query = """
INSERT INTO locations \
(city, latitude, longitude, address, located_user) \
VALUES (%s, %s, %s, %s, %s)
"""
        cur.execute(
            location_query,
            (
                town,
                latitude,
                longitude,
                address,
                user_id
            )
        )

        conn.commit()

    except Exception as e:
        raise e


def _get_location_from_coordinates(
    latitude: float,
    longitude: float
) -> Tuple[str, str]:
    try:
        response = requests.get(
            f'https://api.opencagedata.com/geocode/v1/json?q={latitude}+{longitude}&key={current_app.config["OPENCAGE_API_KEY"]}'
        )
        if response.status_code != 200:
            raise ValueError('Error while getting location from coordinates')

        components: Dict = response.json()['results'][0]['components']
        logger.info(f'{components=}')
        address: str = response.json()['results'][0]['formatted']
        logger.info(f'{address=}')
        town: str = components.get('city', 'Unknown city')
        logger.info(f'{town=}')
        address_without_number = re.sub(r'^\d+\s+', '', address)
        logger.info(f'{address_without_number=}')
        return town, address_without_number

    except Exception as e:
        logger.error(f'{e}')
        raise ValueError(e)


def _get_location_from_ip(user_ip: str) -> Tuple[float, float, str]:
    try:
        response = requests.get(f'http://ipinfo.io/{user_ip}/json')
        if response.status_code != 200:
            raise ValueError('Error while getting location from ip')

        data: Dict = response.json()
        longitude, latitude = data['loc'].split(',')
        town = data.get('city', 'Unknown city')
        return float(longitude), float(latitude), town
    except Exception as e:
        logger.error(f'{e}')
        raise ValueError(e)

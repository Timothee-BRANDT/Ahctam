from flask import (
    current_app,
    url_for,
    render_template,
    request,
    jsonify,
)
from logger import logger
from typing import List, Dict
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


def store_profile_informations(conn, cur, form, user_id):
    try:
        # User
        user_query = """
UPDATE users
SET age = %s, gender = %s,\
sexual_preferences = %s,\
biography = %s,\
firstname = %s,\
lastname = %s,\
email = %s
WHERE id = %s
        """
        cur.execute(user_query, (
            int(form.age.data),
            form.gender.data,
            form.sexualPreference.data,
            form.biography.data,
            form.firstname.data,
            form.lastname.data,
            form.email.data,
            user_id
        ))

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
        print('interests from form are', interests)
        interests_query = """
SELECT id FROM interests WHERE name = %s
        """
        for interest in interests:
            cur.execute(interests_query, (interest,))
            interest_id = cur.fetchone()[0]
            user_interest_query = """
INSERT INTO user_interests (user_id, interest_id)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
            """
            cur.execute(user_interest_query, (user_id, interest_id))

        # Location
        town = form.town.data
        print('town from form is', town)
        if not town:
            longitude, latitude, town = _get_location_from_ip()
            print('no town: from ip is', town)
        else:
            location = form.location.data
            latitude = location[0]
            longitude = location[1]

        # NOTE: Testing
        return jsonify({'message': 'Testing'}), 200

        location_query = """
INSERT INTO locations \
(city, latitude, longitude, address, located_user)
VALUES (%s, %s, %s, %s, %s)
        """
        cur.execute(location_query, (
            town,
            float(latitude),
            float(longitude),
            form.address.data,
            user_id)
        )
        conn.commit()

    except Exception as e:
        logger.error(f'Error while storing profile informations: {e}')
        raise ValueError(e)
    finally:
        cur.close()
        conn.close()


def _get_location_from_ip():
    response = requests.get('https://api.ipify.org?format=json')
    print(response.json())
    user_ip = response.json()['ip']
    # user_ip = request.remote_addr
    # print(user_ip)
    response = requests.get(f'http://ipinfo.io/{user_ip}/json')
    print(response.json())
    if response.status_code == 200:
        longitude, latitude = response.json()['loc'].split(',')
        town = response.json()['city']
        return longitude, latitude, town
    else:
        return None, None, None

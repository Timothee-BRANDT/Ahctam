from .. import main
from typing import Dict, List, Tuple
from geopy.geocoders import Nominatim
from logger import logger
from flask import (
    request,
    jsonify,
)
from ...database import get_db_connection
from app.authentication.forms import ProfileForm
from app.authentication.views.decorators import jwt_required
from psycopg2.extras import RealDictCursor


@main.route('/update-profile', methods=['POST'])
@jwt_required
def update_profile():
    try:
        data = request.get_json()
        profile = data.get('payload', {})
        user_id = profile.get('id')
        form = ProfileForm(data=profile)
        form.validate()

        _update_profile_informations(
            form,
            user_id
        )
        return jsonify({'message': 'Profile updated'}), 200

    except Exception as e:
        logger.error(f'Error while updating profile: {e}')
        return jsonify({'error': str(e)}), 400


def _update_profile_informations(form, user_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
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
        logger.info(f'User informations updated for user {user_id}')

        # Pictures
        delete_pictures_query = """
DELETE FROM pictures
WHERE owner = %s
        """
        new_pictures_query = """
INSERT INTO pictures (url, owner)
VALUES (%s, %s)
        """
        profile_picture_query = """
UPDATE pictures
SET is_profile_picture = TRUE
WHERE url = %s AND owner = %s
        """
        cur.execute(delete_pictures_query, (user_id,))
        raw_photos: List = form.photos.data
        photos: List = [photo for photo in raw_photos if photo]
        for photo in photos:
            cur.execute(new_pictures_query, (photo, user_id))
        cur.execute(profile_picture_query, (photos[0], user_id))

        # Interests
        actual_user_interests_query = """
SELECT i.id, i.name
FROM user_interests ui
JOIN interests i ON ui.interest_id = i.id
WHERE user_id = %s
        """
        result = cur.execute(actual_user_interests_query, (user_id,))
        actual_user_interests_id_and_names: Dict = dict(result)
        logger.info(
            f'Actual user interests: {actual_user_interests_id_and_names}')
        new_user_interests: List[str] = form.interests.data
        logger.info(f'New user interests: {new_user_interests}')

        for id, name in actual_user_interests_id_and_names.items():
            if name not in new_user_interests:
                delete_interest_query = """
DELETE FROM user_interests
WHERE user_id = %s AND interest_id = %s
                """
                cur.execute(delete_interest_query, (user_id, id))

        for interest in new_user_interests:
            if interest.lower() not in actual_user_interests_id_and_names.values().lower():
                interest_query = """
INSERT INTO user_interests (user_id, interest_id)
VALUES (%s, %s)
                """
                cur.execute(interest_query, (user_id, interest))

        # Location
        new_address: str = form.address.data
        old_address_query = """
SELECT address
FROM locations
WHERE user_id = %s
        """
        cur.execute(old_address_query, (user_id,))
        old_address = cur.fetchone()['address']
        if old_address != new_address:
            _update_location_informations(
                cur,
                new_address,
                user_id
            )

        conn.commit()
        logger.info(f'Profile informations updated for user {user_id}')

    except Exception as e:
        logger.error(f'Error while storing profile informations: {e}')
        conn.rollback()
        raise ValueError(e)
    finally:
        cur.close()
        conn.close()


def _update_location_informations(
        cur,
        address: str,
        user_id: int
):
    try:
        latitude, longitude, town = _get_location_from_address(address)
        location_query = """
UPDATE locations
SET town = %s, latitude = %s, longitude = %s, address = %s
WHERE user_id = %s
        """
        cur.execute(location_query, (
            town,
            latitude,
            longitude,
            address,
            user_id
        ))

    except Exception as e:
        logger.error(f'Error while updating location informations: {e}')
        raise ValueError(e)


def _get_location_from_address(address: str) -> Tuple[float, float, str]:
    """
    Geolocation from IP
    """
    try:
        geolocator = Nominatim(user_agent="geoapiExercises")
        location = geolocator.geocode(address)

        if location:
            latitude = location.latitude
            longitude = location.longitude
            city = location.raw.get('address', {}).get('city', None)
            if not city:
                city = location.raw.get('address', {}).get('town', None)
            if not city:
                location.raw.get('address', {}).get('village', None)
            if not city:
                city = address.split(' ')[-1]
            return (latitude, longitude, city)
        else:
            raise ValueError("Adresse introuvable.")

    except Exception as e:
        logger.error(f'Error while getting coordinates from address: {e}')
        raise ValueError(e)

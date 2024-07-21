from app.database import get_db_connection
from typing import Dict
from psycopg2.extras import RealDictCursor
from flask import jsonify


def get_user_info(user_id: int):
    # TODO: Add is_connected when the sockets are implemented
    user_query = """
SELECT
    id, \
    username, \
    firstname, \
    lastname,\
    age,\
    is_active,\
    email,\
    biography,\
    gender,\
    sexual_preferences,\
    last_connexion,\
    created_at,\
    fame AS fame_rating
FROM Users
WHERE id = %s
    """
    location_query = """
SELECT city, latitude, longitude, address
FROM Locations
WHERE located_user = %s
    """
    user_interests_query = """
SELECT interest_id
FROM User_interests
WHERE user_id = %s
    """
    interests_query = """
SELECT name
FROM Interests
WHERE id = %s
    """
    all_pictures_query = """
SELECT url
FROM Pictures
WHERE owner = %s
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    interests = []
    try:
        # User data
        cur.execute(user_query, (user_id,))
        result = cur.fetchone()
        user_info: Dict = dict(result)
        user_info['firstTimeLogged'] = False

        # Location
        cur.execute(location_query, (user_id,))
        result = cur.fetchone()
        location_info: Dict = dict(result)
        user_info['location_list'] = [float(location_info['latitude']),
                                      float(location_info['longitude'])]
        user_info['town'] = location_info['city']
        user_info['address'] = location_info['address']

        # Interests
        cur.execute(user_interests_query, (user_id,))
        user_interests = cur.fetchall()
        for user_interest in user_interests:
            cur.execute(interests_query, (user_interest['interest_id'],))
            interest = cur.fetchone()
            interests.append(interest['name'])
        user_info['interests'] = interests

        # Pictures
        cur.execute(all_pictures_query, (user_id,))
        all_pictures = cur.fetchall()
        user_info['photos'] = [picture['url'] for picture in all_pictures]

        flattened_response = {**user_info}
        flattened_response['latitude'] = user_info['location_list'][0]
        flattened_response['longitude'] = user_info['location_list'][1]
        del flattened_response['location_list']

    except Exception as e:
        return {'error': str(e)}, 400
    finally:
        cur.close()
        conn.close()

    return flattened_response, 200

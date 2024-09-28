from typing import Dict, List, Tuple

from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from logger import logger


def get_user_info(user_id: int) -> Tuple[Dict, int]:
    """
    """
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
    status,\
    last_connexion,\
    status,\
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
    logger.info(f'Getting user info for user {user_id}')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    interests: List = []
    try:
        # User data
        cur.execute(user_query, (user_id,))
        result = cur.fetchone()
        user_info: Dict = dict(result)
        user_info['firstTimeLogged'] = False
        logger.info(f'User info: {result}')

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
        user_interests: List = cur.fetchall()
        for user_interest in user_interests:
            cur.execute(interests_query, (user_interest['interest_id'],))
            interest = cur.fetchone()
            interests.append(interest['name'])
        user_info['interests'] = interests

        # Pictures
        cur.execute(all_pictures_query, (user_id,))
        all_pictures = cur.fetchall()
        user_info['photos'] = [picture['url'] for picture in all_pictures]

        flattened_response: Dict = {**user_info}
        flattened_response['latitude'] = user_info['location_list'][0]
        flattened_response['longitude'] = user_info['location_list'][1]
        del flattened_response['location_list']
        return flattened_response, 200

    except Exception as e:
        logger.error(f'Error while getting user info: {str(e)}')
        raise e
    finally:
        cur.close()
        conn.close()


def get_users_who_like_user(user_id: int):
    likers_id_query = """
SELECT liker
FROM Likes
WHERE user_liked = %s
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    users: List[Dict] = []
    try:
        cur.execute(likers_id_query, (user_id,))
        likers = cur.fetchall()
        for liker in likers:
            user: Tuple[Dict, int] = get_user_info(liker['liker'])
            if user[1] == 200:
                users.append(user[0])

    except Exception as e:
        return {'error': str(e)}, 400
    finally:
        cur.close()
        conn.close()

    return users, 200


def get_views_history(user_id: int) -> Tuple[List[Dict], int]:
    viewers_id_query = """
SELECT user_viewed
FROM Views
WHERE viewer = %s
ORDER BY date DESC
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    users: List[Dict] = []
    try:
        cur.execute(viewers_id_query, (user_id,))
        viewers: List = cur.fetchall()
        logger.info(f'Viewers: {viewers}')
        for viewer in viewers:
            user: Tuple[Dict, int] = get_user_info(viewer['user_viewed'])
            if user[1] == 200:
                users.append(user[0])
        return users, 200

    except Exception as e:
        raise e
    finally:
        cur.close()
        conn.close()

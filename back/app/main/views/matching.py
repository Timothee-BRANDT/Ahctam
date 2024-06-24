from flask import (
    jsonify,
    request,
    current_app,
)
import jwt
import math
from numpy import dot
from numpy.linalg import norm
from psycopg2.extras import RealDictCursor
from .. import main
from app.database import get_db_connection
from app.authentication.views.decorators import jwt_required


def haversine(lat1, lon1, lat2, lon2):
    earth_radius = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = earth_radius * c

    return distance


def age_similarity(age1, age2):
    return 1 / (1 + abs(age1 - age2))


def interest_similarity(interests1, interests2):
    return dot(interests1, interests2) / (norm(interests1) * norm(interests2))


def fame_similarity(fame1, fame2):
    return 1 / (1 + abs(fame1 - fame2))


def matching_score(user1, user2):
    geo_weight = 0.5
    age_weight = 0.3
    interest_weight = 0.3
    fame_weight = 0.1

    geo_score = haversine(user1['latitude'], user1['longitude'],
                          user2['latitude'], user2['longitude']) * geo_weight
    age_score = age_similarity(user1['age'], user2['age']) * age_weight
    interest_score = interest_similarity(
        user1['interests'], user2['interests']) * interest_weight
    fame_score = fame_similarity(user1['fame'], user2['fame']) * fame_weight

    return geo_score + age_score + interest_score + fame_score


def get_matching_users(user_data, cursor, offset, limit):
    """
    1. Get all the users with the matching gender and sexual preferences
    """
    correct_gender_query = """
SELECT id,
       firstname,
       age,
       biography,
       gender,
       sexual_preferences,
       fame
FROM users
WHERE id != %s
  AND (
        (%s = 'both' AND ((sexual_preferences = 'both') OR (sexual_preferences = %s)))
        OR (gender = %s AND ((sexual_preferences = 'both') OR (sexual_preferences = %s)))
      )
"""

    correct_gender_query_params = (user_data['id'],
                                   user_data['sexual_preferences'],
                                   user_data['gender'],
                                   user_data['gender'],
                                   user_data['sexual_preferences'])
    location_query = """
SELECT latitude,
         longitude
FROM locations
WHERE located_user = %s
"""
    try:
        cursor.execute(location_query, (user_data['id'],))
        location = cursor.fetchone()
        user_data['latitude'] = location['latitude']
        user_data['longitude'] = location['longitude']

        cursor.execute(correct_gender_query, correct_gender_query_params)
        matching_users = cursor.fetchall()
        for matching_user in matching_users:
            cursor.execute(location_query, (matching_user['id'],))
            matching_user_location = cursor.fetchone()
            print(matching_user_location, 'coucou')
            matching_user['latitude'] = matching_user_location['latitude']
            matching_user['longitude'] = matching_user_location['longitude']
            matching_user['matching_score'] = matching_score(
                user_data,
                matching_user)
        print('we are coucou')
        matching_users = sorted(
            matching_users, key=lambda x: x['matching_score'], reverse=True)
        print(matching_users)
    except Exception as e:
        raise Exception(str(e))

    return matching_users[offset:offset + limit]


@main.route('/test-redis', methods=['GET'])
def test_redis():
    redis_client = current_app.extensions['redis']
    redis_client.set('test', 'coucou')
    test = redis_client.get('test').decode('utf-8')
    return jsonify({'message': test}), 200


@main.route('/browse', methods=['GET'])
# @jwt_required
def browse():
    """
    Actually it will compute the algorithm every time a user wants to browse
    It would be better to return them all, then the front-end will handle the pagination
    """
    offset = request.args.get('offset', 0)
    limit = request.args.get('limit', 10)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # token = request.headers.get('Authorization').split(' ')[1]
        # user = jwt.decode(
        #     token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = {'id': 5}
        user_query = """
SELECT id,\
firstname,\
lastname,\
age,\
biography,\
gender,\
sexual_preferences,\
fame
FROM users
WHERE id = %s
        """
        cur.execute(user_query, (user['id'],))
        user_data = cur.fetchone()
        print(user_data)
        matching_users = get_matching_users(user_data, cur, offset, limit)
        print('coucou')

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'users': matching_users}), 200

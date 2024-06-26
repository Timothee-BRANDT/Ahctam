from flask import (
    jsonify,
    request,
    current_app,
)
import json
import jwt
import math
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
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
    interests1: list = interests1.split(', ')
    interests2: list = interests2.split(', ')

    vectorizer = CountVectorizer().fit(interests1 + interests2)
    print(type(vectorizer))
    print('vectorizer', vectorizer)
    vector_1 = vectorizer.transform(interests1).toarray()
    print(type(vector_1))
    print('vector_1', vector_1)
    vector_2 = vectorizer.transform(interests2).toarray()
    print(type(vector_2))
    print('vector_2', vector_2)

    return cosine_similarity(vector_1, vector_2)[0][0]


def fame_similarity(fame1, fame2):
    return 1 / (1 + abs(fame1 - fame2))


def matching_score(user1, user2):
    geo_weight = 0.5
    age_weight = 0.3
    interest_weight = 0.3
    fame_weight = 0.1

    geo_score = haversine(user1['latitude'], user1['longitude'],
                          user2['latitude'], user2['longitude']) * geo_weight
    print('geo_score', geo_score)
    age_score = age_similarity(user1['age'], user2['age']) * age_weight
    print('age_score', age_score)
    print('1', user1['interests'])
    print('2', user2['interests'])
    interest_score = interest_similarity(
        user1['interests'], user2['interests']) * interest_weight
    print('interest_score', interest_score)
    fame_score = fame_similarity(user1['fame'], user2['fame']) * fame_weight
    print('fame_score', fame_score)

    return geo_score + age_score + interest_score + fame_score


def get_matching_users(user_data, cursor, offset, limit):
    """
    TODO: Now work on the interests brooo
    It will need another join with the user_interest relation table
    """
    gender_sex_query = """
    SELECT u.id,
           u.firstname,
           u.age,
           u.biography,
           u.gender,
           u.sexual_preferences,
           u.fame,
           l.latitude,
           l.longitude,
           l.city,
           STRING_AGG(i.name, ', ') AS interests
    FROM users u
    JOIN locations l ON u.id = l.located_user
    LEFT JOIN user_interests ui ON u.id = ui.user_id
    LEFT JOIN interests i ON ui.interest_id = i.id
    WHERE u.id != %s
      AND (
            (%s = 'both' AND (u.sexual_preferences = 'both' OR u.sexual_preferences = %s))
            OR (u.gender = %s AND (u.sexual_preferences = 'both' OR u.sexual_preferences = %s))
          )
    GROUP BY u.id, u.firstname, u.age, u.biography, u.gender, u.sexual_preferences, u.fame, l.latitude, l.longitude, l.city
    """

    query_params = (user_data['id'],
                    user_data['sexual_preferences'],
                    user_data['gender'],
                    user_data['gender'],
                    user_data['sexual_preferences'])

    location_query = """
    SELECT l.latitude,
           l.longitude,
           l.city,
           STRING_AGG(i.name, ', ') AS interests
    FROM locations l
    LEFT JOIN user_interests ui ON ui.user_id = l.located_user
    LEFT JOIN interests i ON ui.interest_id = i.id
    WHERE located_user = %s
    GROUP BY l.latitude, l.longitude, l.city
    """
    try:
        cursor.execute(location_query, (user_data['id'],))
        location_and_interests = cursor.fetchone()
        user_data['latitude'] = location_and_interests['latitude']
        user_data['longitude'] = location_and_interests['longitude']
        user_data['city'] = location_and_interests['city']
        user_data['interests'] = location_and_interests['interests']
        print('the user data is ', user_data)

        cursor.execute(gender_sex_query, query_params)
        matching_users = cursor.fetchall()

        for matching_user in matching_users:
            matching_user['matching_score'] = matching_score(
                user_data, matching_user)
            print('user_name', matching_user['firstname'])
            print('matching_score', matching_user['matching_score'])

        matching_users: list = sorted(
            matching_users, key=lambda x: x['matching_score'], reverse=True)
    except Exception as e:
        raise Exception(str(e))

    return matching_users


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
    After talking with collegues, it's the backend job
    We'll use redis to avoid recomputing the algorithm (Bonus)
    """
    offset: int = int(request.args.get('offset', 0))
    limit: int = int(request.args.get('limit', 10))
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    redis_client = current_app.extensions['redis']
    matching_users: dict = {}
    try:
        # token = request.headers.get('Authorization').split(' ')[1]
        # user = jwt.decode(
        #     token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        # WARNING: Remove this mock
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
        user_data: dict = cur.fetchone()
        print(user_data)
        redis_key: str = f"matching:{user['id']}"
        if not redis_client.exists(redis_key):
            print('nothing in redis yet')
            matching_users: list = get_matching_users(
                user_data, cur, offset, limit)
            print('we received the matching users: ', matching_users)
            redis_client.set(redis_key, json.dumps(matching_users), ex=3600)
        else:
            print('something in redis')
            matching_users: list = json.loads(
                redis_client.get(redis_key).decode('utf-8'))
        print('bonsoir')

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    # return jsonify({'users': matching_users[offset:limit]}), 200
    print(type(offset), offset, type(limit), limit)
    return jsonify({'users': matching_users[offset:limit]}), 200

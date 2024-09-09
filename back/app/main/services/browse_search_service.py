from typing import (
    Dict,
    List,
)
from flask import (
    jsonify,
    current_app,
)
import json
from psycopg2.extras import RealDictCursor
from app.main import main
from app.database import get_db_connection
from app.main.services.algo_service import matching_score
# from app.authentication.views.decorators import jwt_required


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


def apply_filters(
        matching_users: List[Dict],
        age: int,
        fame: int,
        distance: int,
        common_interests: int):
    """
    This function will filter the matching users based on the query parameters
    """
    if age:
        matching_users = [
            user for user in matching_users if user['age'] == age]
    if fame:
        matching_users = [
            user for user in matching_users if user['fame'] == fame]
    if distance:
        matching_users = [
            user for user in matching_users if user['distance'] == distance]
    if common_interests:
        matching_users = [
            user for user in matching_users if user['common_interests'] == common_interests]


def perform_browsing(
    user_id: int,
    age: int = None,
    fame: int = None,
    distance: int = None,
    common_interests: int = None,
    offset: int = 0,
    limit: int = 10
):
    """
    Actually it will compute the algorithm every time a user wants to browse
    After talking with collegues, it's the backend job
    We'll use redis to avoid recomputing the algorithm (Bonus)
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    redis_client = current_app.extensions['redis']
    matching_users: Dict = {}
    try:
        # token = request.headers.get('Authorization').split(' ')[1]
        # user = jwt.decode(
        #     token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        # WARNING: Remove this mock, replace by the id in the param
        user = {'id': 5}
        user_query = """
SELECT id,\
firstname,\
lastname,\
age,\
biography,\
gender,\
sexual_preferences,\
status,\
fame
FROM users
WHERE id = %s
        """
        redis_key: str = f"matching:{user['id']}"
        matching_users: List = []
        if not redis_client.exists(redis_key):
            print('nothing in redis yet')
            cur.execute(user_query, (user['id'],))
            user_data: Dict = dict(cur.fetchone())
            print(user_data)
            matching_users = get_matching_users(
                user_data,
                cur,
                offset,
                limit
            )
            print('we received the matching users: ', matching_users)
            redis_client.set(redis_key, json.dumps(matching_users), ex=3600)
        else:
            print('something in redis')
            matching_users = json.loads(
                redis_client.get(redis_key).decode('utf-8'))
            print('in redis the matching users: ', matching_users)
        print('end of browsing')
        # TODO: if filters validator, test with and without
        matching_users = apply_filters(
            matching_users,
            age,
            fame,
            distance,
            common_interests
        )
        return jsonify({'users': matching_users[offset:limit]}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

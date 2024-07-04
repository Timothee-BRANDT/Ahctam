from flask import (
    jsonify,
    request,
    current_app,
)
from typing import Dict
import jwt
from psycopg2.extras import RealDictCursor
from . import api
from ..database import get_db_connection
from ..authentication.views.decorators import jwt_required


@api.route('/test')
def get_test():
    data = {"message": "Hello World from the API!"}
    return jsonify(data)


@api.route('/getUserInfo', methods=['GET'])
@jwt_required
def get_user_info():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
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
    password,\
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
    refresh_token_query = """
SELECT token
FROM refresh_tokens
WHERE user_id = %s
"""
    interests = []
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])

        # User data
        cur.execute(user_query, (user['id'],))
        result = cur.fetchone()
        user_info: Dict = dict(result)
        user_info['firstTimeLogged'] = False
        user_info['jwt_token'] = token

        # Location
        cur.execute(location_query, (user['id'],))
        result = cur.fetchone()
        location_info: Dict = dict(result)
        user_info['location'] = [float(location_info['latitude']),
                                 float(location_info['longitude'])]
        user_info['town'] = location_info['city']
        user_info['address'] = location_info['address']

        # Interests
        cur.execute(user_interests_query, (user['id'],))
        user_interests = cur.fetchall()
        for user_interest in user_interests:
            cur.execute(interests_query, (user_interest['interest_id'],))
            interest = cur.fetchone()
            interests.append(interest)
        user_info['interests'] = interests

        # Pictures
        cur.execute(all_pictures_query, (user['id'],))
        all_pictures = cur.fetchall()
        user_info['photos'] = [picture['url'] for picture in all_pictures]

        # Refresh token
        cur.execute(refresh_token_query, (user['id'],))
        refresh_token = cur.fetchone()
        user_info['refresh_token'] = refresh_token['token']

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({
        'user_info': user_info,
    }), 200


@api.route('/interests')
@jwt_required
def get_interests():
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
SELECT name
FROM interests
    """
    try:
        cur.execute(query)
        interests = cur.fetchall()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'interests': interests}), 200
    finally:
        cur.close()
        conn.close()


@api.route('/getMyLikes', methods=['GET'])
@jwt_required
def get_user_likes():
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
SELECT COUNT(*)
FROM likes
WHERE user_liked = %s
    """
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        cur.execute(query, (user['id'],))
        likes = cur.fetchone()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'likes': likes}), 200


@api.route('/getMyViews', methods=['GET'])
@jwt_required
def get_user_views():
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
SELECT COUNT(*)
FROM views
WHERE user_viewed = %s
    """
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        cur.execute(query, (user['id'],))
        views = cur.fetchone()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'views': views}), 200


@api.route('/isThisUserBlocked', methods=['GET'])
def is_this_user_blocked():
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
SELECT COUNT(*)
FROM blocks
WHERE blocker = %s
AND user_blocked = %s
    """
    try:
        data = request.get_json()
        user_blocked = data.get('user_blocked')

        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])

        cur.execute(query, (user['id'], user_blocked))
        is_blocked = cur.fetchone()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'is_blocked': is_blocked}), 200


@api.route('/filterUsers', methods=['GET'])
@jwt_required
def get_profiles():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # TODO: What if there is no Filter By ? Do we use our matching algorithm ?
    sort_by = request.args.get('sortBy')
    filter_by = request.args.get('filterBy')
    filter_age = request.args.get('filterAge')
    filter_fame = request.args.get('filterFame')
    filter_location = request.args.get('filterLocation')
    filter_tags = request.args.get('filterTags')
    query = """
    SELECT * FROM users
    WHERE 1 = 1
    """
    params: tuple = ()
    if filter_age:
        query += " AND age = %s"
        params += (filter_age,)
    if filter_fame:
        query += " AND fame = %s"
        params += (filter_fame,)
    if filter_location:
        query += " AND location = %s"
        params += (filter_location,)
    if filter_tags:
        query += " AND tags = %s"
        params += (filter_tags,)
    if sort_by:
        query += " ORDER BY %s"
        params += (sort_by,)

    try:
        cur.execute(query, params)
        profiles = cur.fetchall()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'profiles': profiles}), 200
    finally:
        cur.close()
        conn.close()

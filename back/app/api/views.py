from flask import (
    jsonify,
    request,
    current_app,
)
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
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    user_query = """
SELECT firstname, lastname, age, email, biography, gender, sexual_preferences, fame
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
    picture_query = """
SELECT url
FROM Pictures
WHERE owner = %s
AND is_profile_picture = TRUE
    """
    all_pictures_query = """
SELECT url
FROM Pictures
WHERE owner = %s
    """
    interests = []
    try:
        cur.execute(user_query, (user['id'],))
        user_info = cur.fetchone()
        cur.execute(location_query, (user['id'],))
        location_info = cur.fetchone()
        cur.execute(user_interests_query, (user['id'],))
        user_interests = cur.fetchall()
        for user_interest in user_interests:
            cur.execute(interests_query, (user_interest['interest_id'],))
            interest = cur.fetchone()
            interests.append(interest)
        cur.execute(picture_query, (user['id'],))
        profile_picture = cur.fetchone()
        cur.execute(all_pictures_query, (user['id'],))
        all_pictures = cur.fetchall()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({
        'user': user_info,
        'location': location_info,
        'interests': interests,
        'profile_picture': profile_picture,
        'all_pictures': all_pictures
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
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    query = """
SELECT COUNT(*)
FROM likes
WHERE user_liked = %s
    """
    try:
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
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    query = """
SELECT COUNT(*)
FROM views
WHERE user_viewed = %s
    """
    try:
        cur.execute(query, (user['id'],))
        views = cur.fetchone()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'views': views}), 200


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

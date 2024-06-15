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
def get_user_info():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    user_query = """
    SELECT firstname, lastname, password, age, email, biography, gender, sexual_preferences
    FROM Users
    WHERE id = %s
    """
    location_query = """
    SELECT city, lattitude, longitude
    FROM Locations
    WHERE located_user = %s
    """
    try:
        cur.execute(user_query, (user['id'],))
        user_info = cur.fetchone()
        cur.execute(location_query, (user['id'],))
        location_info = cur.fetchone()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({
        'user': user_info,
        'location': location_info
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
    print(user)
    # Query that counts in Likes table where 'user_liked' is the user's id
    query = """
    SELECT COUNT(*)
    FROM likes
    WHERE user_liked = %s
    """
    try:
        cur.execute(query, (user['id'],))
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        likes = cur.fetchone()
    finally:
        cur.close()
        conn.close()
    return jsonify({'likes': likes}), 200


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

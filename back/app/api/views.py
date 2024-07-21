from flask import (
    jsonify,
    request,
    current_app,
)
import jwt
from psycopg2.extras import RealDictCursor
from app.api.services.user_services import (
    get_user_info,
    get_users_who_like_user,
    get_users_who_viewed_user,
)
from . import api
from ..database import get_db_connection
from ..authentication.views.decorators import jwt_required


@api.route('/test')
def get_test():
    data = {"message": "Hello World from the API!"}
    return jsonify(data)


@api.route('/checkUsername', methods=['POST'])
@jwt_required
def check_username():
    query = """
SELECT id
FROM users
WHERE username = %s
    """
    username = request.get_json().get('username')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(query, (username,))
        user = cur.fetchone()
        if user:
            return jsonify({'message': 'Found'}), 200
        else:
            return jsonify({'message': 'Not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@api.route('/getUserInfo', methods=['GET'])
@jwt_required
def get_user_info_controller():
    # TODO: Add is_connected when the sockets are implemented
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    user_id = user['id']

    response, status_code = get_user_info(user_id)

    return jsonify(response), status_code


@api.route('/getOtherUserInfo', methods=['GET'])
@jwt_required
def get_other_user_info_controller():
    # TODO: Add status when the sockets are implemented
    user_id = request.args.get('user_id')

    response, status_code = get_user_info(user_id)

    return jsonify(response), status_code


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


@api.route('/getMyNumberOfLikes', methods=['GET'])
@jwt_required
def get_nb_of_likes():
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


@api.route('/getMyLikes', methods=['GET'])
@jwt_required
def get_users_who_like_user_controller():
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']

        response, status_code = get_users_who_like_user(user_id)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    return jsonify(response), status_code


@api.route('/getMyNumberOfViews', methods=['GET'])
@jwt_required
def get_nb_of_views():
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


@api.route('/getMyViews', methods=['GET'])
@jwt_required
def get_users_who_viewed_user_controller():
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']

        response, status_code = get_users_who_viewed_user(user_id)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    return jsonify(response), status_code


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

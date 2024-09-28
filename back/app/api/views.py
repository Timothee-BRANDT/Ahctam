from typing import Dict, List, Optional, Tuple

import jwt
from flask import current_app, jsonify, request
from psycopg2.extras import RealDictCursor

from app.api import api
from app.api.services.user_services import (get_user_info,
                                            get_users_who_like_user,
                                            get_views_history)
from app.authentication.views.decorators import jwt_required
from app.database import get_db_connection
from logger import logger


@api.route('/doILikeThisUser/<int:target_id>', methods=['GET'])
@jwt_required
def does_user_like_me(target_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
SELECT COUNT(*)
FROM likes
WHERE liker = %s
AND user_liked = %s
    """
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        requester_user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = requester_user['id']

        cur.execute(query, (user_id, target_id))
        query_result: Tuple = cur.fetchone()
        return jsonify({'liked': bool(query_result[0] > 0)}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


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
    connector = get_db_connection()
    cursor = connector.cursor(cursor_factory=RealDictCursor)
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']

        query = """
SELECT id, gender, username, email, firstname, lastname
FROM users
WHERE id = %s
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        gender = result['gender']
        if not gender:
            result['message'] = 'First login'
            return jsonify(result), 200

        response: Dict
        status_code: int
        response, status_code = get_user_info(user_id)
        return jsonify(response), status_code

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        connector.close()


@api.route('/getOtherUserInfo/<int:user_id>', methods=['GET'])
@jwt_required
def get_other_user_info_controller(user_id: int):
    print('getOtherUserInfo')
    if not user_id:
        return jsonify({'error': 'User id not provided'}), 400

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
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        cur.execute(query, (user['id'],))
        likes = cur.fetchone()

        return jsonify({'likes': likes}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@api.route('/getMyLikes', methods=['GET'])
@jwt_required
def get_users_who_like_user_controller():
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']

        response, status_code = get_users_who_like_user(user_id)

        return jsonify(response), status_code

    except Exception as e:
        return jsonify({'error': str(e)}), 400


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
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        cur.execute(query, (user['id'],))
        views = cur.fetchone()

        return jsonify({'views': views}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@api.route('/getMyMatches', methods=['GET'])
@jwt_required
def get_user_matches():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    matches_query = """
SELECT u.id
FROM users u
JOIN matches m ON u.id = m.user1 OR u.id = m.user2
WHERE (m.user1 = %s OR m.user2 = %s)
AND u.id != %s
    """
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']
        cursor.execute(matches_query, (user_id, user_id, user_id))
        matches_id_list: List = [match['id'] for match in cursor.fetchall()]
        matches: List = []
        for match_id in matches_id_list:
            user, status_code = get_user_info(match_id)
            if status_code == 200:
                matches.append(user)

        return jsonify(matches), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@api.route('/getMyViews', methods=['GET'])
@jwt_required
def get_users_i_viewed_controller():
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']

        response, status_code = get_views_history(user_id)

        return jsonify(response), status_code

    except Exception as e:
        return jsonify({'error': str(e)}), 400


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

        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])

        cur.execute(query, (user['id'], user_blocked))
        is_blocked = cur.fetchone()

        return jsonify({'is_blocked': is_blocked}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

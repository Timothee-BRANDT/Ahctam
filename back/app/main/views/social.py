from flask import (
    jsonify,
    request,
    current_app,
)
import jwt
from psycopg2.extras import RealDictCursor
from .. import main
from app.database import get_db_connection
from app.authentication.views.decorators import jwt_required


@main.route('/viewUser', methods=['POST'])
@jwt_required
def view_a_user():
    """
    Viewing a user also increases his fame by 1
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        data = request.get_json()
        user_viewed = data.get('user_viewed')
        # TODO: We are here
        pass
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@main.route('/likeUser', methods=['POST'])
@jwt_required
def like_a_user():
    """
    Liking a user also increases his fame by 3
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    data = request.get_json()
    user_liked = data.get('user_liked')
    like_query = """
INSERT INTO likes (liker, user_liked)
VALUES (%s, %s)
    """
    fame_query = """
UPDATE users
SET fame = fame + 3
WHERE id = %s
    """
    try:
        cur.execute(like_query, (user['id'], user_liked))
        cur.execute(fame_query, (user_liked,))
        conn.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'User liked'}), 200


@main.route('/dislikeUser', methods=['POST'])
@jwt_required
def unlike_a_user():
    """
    Unliking a user also reduces his fame by 3
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    data = request.get_json()
    user_unliked = data.get('user_unliked')
    unlike_query = """
DELETE FROM likes
WHERE liker = %s AND user_liked = %s
    """
    fame_query = """
UPDATE users
SET fame = fame - 3
WHERE id = %s
    """
    try:
        cur.execute(unlike_query, (user['id'], user_unliked))
        cur.execute(fame_query, (user_unliked,))
        conn.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'User unliked'}), 200


@main.route('/blockUser', methods=['POST'])
@jwt_required
def block_a_user():
    """
    Blocking a user also reduces his fame by 5
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    token = request.headers.get('Authorization').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    data = request.get_json()
    user_blocked = data.get('user_blocked')
    block_query = """
INSERT INTO blocks (blocker, user_blocked)
VALUES (%s, %s)
    """
    fame_query = """
UPDATE users
SET fame = fame - 5
WHERE id = %s
    """
    try:
        cur.execute(block_query, (user['id'], user_blocked))
        cur.execute(fame_query, (user_blocked,))
        conn.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'User blocked'}), 200

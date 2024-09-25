from typing import Dict

import jwt
from flask import current_app, jsonify, request
from psycopg2.extras import RealDictCursor

from app.authentication.views.decorators import jwt_required
from app.database import get_db_connection
from app.main.views.notifications import send_notification, store_notification
from logger import logger

from .. import main

# TODO: - a @blocked_protection decorator to protect routes from blocked users
#       - Trello for Tim
#       - Match users when they like each other
#       - On every /viewUser, send the target to the history of the viewer
#       - /reportUser


@main.route('/viewUser', methods=['POST'])
@jwt_required
def view_a_user():
    """
    Viewing a user also increases his fame by 1
    """
    view_user_query = """
INSERT INTO views (viewer, user_viewed)
VALUES (%s, %s)
ON CONFLICT (viewer, user_viewed)
DO NOTHING
RETURNING *
    """
    fame_query = """
UPDATE users
WHERE id = %s
SET fame = fame + 1
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        data = request.get_json()
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256'])

        user_id: int = int(user['id'])
        user_username: str = user['username']
        user_viewed_id: int = int(data.get('user_id', ''))
        if not user_viewed_id:
            raise ValueError('user_viewed_id is required')

        cursor.execute(view_user_query, (user_id, user_viewed_id))
        result: Dict = dict(cursor.fetchone())
        if result:
            cursor.execute(fame_query, (user_viewed_id,))
            send_notification(
                sender_id=user_id,
                receiver_id=user_viewed_id,
                message=f'{user_username} viewed your profile 👀',
                notification_type='view'
            )
            store_notification(
                cursor=cursor,
                sender_id=user_id,
                receiver_id=user_viewed_id,
                message=f'{user_username} viewed your profile 👀',
                notification_type='view'
            )
            conn.commit()
        return jsonify({'message': 'User viewed'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@main.route('/likeUser', methods=['POST'])
@jwt_required
def like_a_user():
    """
    Liking a user also increases his fame by 3
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
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
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        data = request.get_json()

        user_id: int = int(user['id'])
        user_username: str = user['username']
        user_liked_id: int = int(data.get('user_liked_id', ''))
        if not user_liked_id:
            raise ValueError('user_liked_id is required')

        cursor.execute(like_query, (user_id, user_liked_id))
        cursor.execute(fame_query, (user_liked_id,))

        send_notification(
            sender_id=user_id,
            receiver_id=user_liked_id,
            message=f'{user_username} liked you 😍',
            notification_type='like'
        )
        store_notification(
            cursor=cursor,
            sender_id=user_id,
            receiver_id=user_liked_id,
            message=f'{user_username} liked you 😍',
            notification_type='like'
        )

        conn.commit()
        return jsonify({'message': f'User {user_liked_id} liked'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@main.route('/dislikeUser', methods=['POST'])
@jwt_required
def unlike_a_user():
    """
    Unliking a user also reduces his fame by 3
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    token = request.headers.get('Authorization', '').split(' ')[1]
    user = jwt.decode(
        token, current_app.config['SECRET_KEY'], algorithms=['HS256'])

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
        data = request.get_json()
        user_id: int = int(user['id'])
        user_username: str = user['username']
        user_unliked_id: int = int(data.get('user_disliked_id', ''))
        if not user_unliked_id:
            raise ValueError('user_unliked_id is required')
        logger.info(f'{user["id"]} unliked {user_unliked_id}')

        cursor.execute(unlike_query, (user_id, user_unliked_id))
        if cursor.rowcount > 0:
            cursor.execute(fame_query, (user_unliked_id,))
            send_notification(
                sender_id=user_id,
                receiver_id=user_unliked_id,
                message=f'{user_username} unliked you 💔',
                notification_type='unlike'
            )
            store_notification(
                cursor=cursor,
                sender_id=user_id,
                receiver_id=user_unliked_id,
                message=f'{user_username} unliked you 💔',
                notification_type='unlike'
            )

        conn.commit()
        return jsonify({'message': f'User {user_unliked_id} unliked'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@main.route('/blockUser', methods=['POST'])
@jwt_required
def block_a_user():
    """
    Blocking a user also reduces his fame by 5
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
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
        data = request.get_json()
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])

        user_id: int = int(user['id'])
        user_username: str = user['username']
        user_blocked = data.get('user_id')

        cursor.execute(block_query, (user_id, user_blocked))
        cursor.execute(fame_query, (user_blocked,))

        conn.commit()
        return jsonify({'message': f'User {user_blocked} blocked'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

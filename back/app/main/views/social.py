from typing import Dict

import jwt
from flask import current_app, jsonify, request
from psycopg2.extras import RealDictCursor

from app.authentication.views.decorators import jwt_required
from app.database import get_db_connection
from app.main.services.match import (
    create_match_if_mutual_like,
    delete_match,
    _get_firstname_from_user_id
)
from app.main.views.notifications import send_notification, store_notification
from logger import logger

from .. import main

# TODO:
#       - Reported and Blocked users must not appear in browse


@main.route('/viewUser/<int:user_viewed_id>', methods=['POST'])
@jwt_required
def view_a_user(user_viewed_id: int):
    """
    Viewing a user also increases his fame by 1
    """
    view_user_query = """
INSERT INTO views (date, viewer, user_viewed) 
VALUES (NOW() AT TIME ZONE 'Europe/Paris', %s, %s)
    """
    fame_query = """
UPDATE users
SET fame = fame + 1
WHERE id = %s
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        print('token in viewUser', token)
        user = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256'])
        user_id: int = int(user['id'])
        user_firstname: str = _get_firstname_from_user_id(
            cursor=cursor,
            user_id=user_id
        )

        cursor.execute(view_user_query, (user_id, user_viewed_id))
        cursor.execute(fame_query, (user_viewed_id,))

        send_notification(
            sender_id=user_id,
            receiver_id=user_viewed_id,
            message=f'{user_firstname} viewed your profile 👀',
            notification_type='view'
        )
        store_notification(
            cursor=cursor,
            sender_id=user_id,
            receiver_id=user_viewed_id,
            message=f'{user_firstname} viewed your profile 👀',
            notification_type='view'
        )

        conn.commit()
        return jsonify({'message': f'User {user_firstname} viewed'}), 200

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
        user_firstname: str = _get_firstname_from_user_id(
            cursor=cursor,
            user_id=user_id
        )
        user_liked_id: int = int(data.get('user_liked_id', ''))
        if not user_liked_id:
            raise ValueError('user_liked_id is required')

        cursor.execute(like_query, (user_id, user_liked_id))
        cursor.execute(fame_query, (user_liked_id,))

        send_notification(
            sender_id=user_id,
            receiver_id=user_liked_id,
            message=f'{user_firstname} liked you 😍',
            notification_type='like'
        )
        store_notification(
            cursor=cursor,
            sender_id=user_id,
            receiver_id=user_liked_id,
            message=f'{user_firstname} liked you 😍',
            notification_type='like'
        )
        create_match_if_mutual_like(
            cursor=cursor,
            user_id=user_id,
            user_liked_id=user_liked_id
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
        user_firstname: str = _get_firstname_from_user_id(
            cursor=cursor,
            user_id=user_id
        )
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
                message=f'{user_firstname} unliked you 🤕',
                notification_type='unlike'
            )
            store_notification(
                cursor=cursor,
                sender_id=user_id,
                receiver_id=user_unliked_id,
                message=f'{user_firstname} unliked you 🤕',
                notification_type='unlike'
            )
            delete_match(
                cursor=cursor,
                user_id=user_id,
                user_unliked_id=user_unliked_id
            )

        conn.commit()
        return jsonify({'message': f'User {user_unliked_id} unliked'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@main.route('/blockUser/<int:blocked_user_id>', methods=['POST'])
@jwt_required
def block_a_user(blocked_user_id: int):
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
    remove_like_query = """
DELETE FROM likes
WHERE liker = %s AND user_liked = %s
    """
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])

        user_id: int = int(user['id'])
        user_username: str = user['username']

        cursor.execute(block_query, (user_id, blocked_user_id))
        cursor.execute(fame_query, (blocked_user_id,))
        cursor.execute(remove_like_query, (user_id, blocked_user_id))
        delete_match(
            cursor=cursor,
            user_id=user_id,
            user_unliked_id=blocked_user_id
        )

        conn.commit()
        return jsonify({'message': f'User {user_username} blocked'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@main.route('/reportUser/<int:user_reported_id>', methods=['POST'])
@jwt_required
def report_a_user(user_reported_id: int):
    """
    A report decreases the user's fame by 5
    At 5 reports, the user is banned
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    report_query = """
INSERT INTO reports (reporter, user_reported)
VALUES (%s, %s)
    """
    fame_query = """
UPDATE users
SET fame = fame - 5
WHERE id = %s
    """
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])

        user_id: int = int(user['id'])
        user_username: str = user['username']

        cursor.execute(report_query, (user_id, user_reported_id))
        cursor.execute(fame_query, (user_reported_id,))
        delete_match(
            cursor=cursor,
            user_id=user_id,
            user_unliked_id=user_reported_id
        )

        conn.commit()
        return jsonify({'message': f'User {user_username} reported'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

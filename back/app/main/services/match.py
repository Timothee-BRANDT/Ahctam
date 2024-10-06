from typing import Dict

import jwt
from flask import current_app, jsonify, request

# from app.authentication.views.decorators import jwt_required
# from app.database import get_db_connection
from app.main.views.notifications import send_notification, store_notification
from logger import logger

# from psycopg2.extras import RealDictCursor


def delete_match(
    cursor,
    user_id: int,
    user_unliked_id: int,
) -> None:
    delete_match_query = """
DELETE FROM matches
WHERE
    (user1 = %s AND user2 = %s)
    OR (user1 = %s AND user2 = %s)
    """
    try:
        cursor.execute(
            delete_match_query,
            (user_id, user_unliked_id, user_unliked_id, user_id)
        )
        if cursor.rowcount:
            logger.info(
                f"Deleted match between {user_id} and {user_unliked_id}")
        else:
            logger.info(
                f"No match found between {user_id} and {user_unliked_id}")

    except Exception as e:
        raise e


def create_match_if_mutual_like(
    cursor,
    user_id: int,
    user_liked_id: int,
) -> None:
    check_mutual_like_query = """
SELECT
    l1.liker,
    l1.user_liked
FROM
    likes l1
JOIN
    likes l2
ON
    l1.liker = l2.user_liked
    AND l1.user_liked = l2.liker
WHERE
    l1.liker = %s
    AND l1.user_liked = %s
    """
    create_match_query = """
INSERT INTO matches (user1, user2)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
    """
    try:
        cursor.execute(
            check_mutual_like_query,
            (user_id, user_liked_id)
        )
        mutual_like_result = cursor.fetchone()
        logger.info(f"Mutual like result: {mutual_like_result}")
        if not mutual_like_result:
            return

        cursor.execute(
            create_match_query,
            (user_id, user_liked_id)
        )
        user_firstname = _get_firstname_from_user_id(
            cursor=cursor,
            user_id=user_id
        )
        user_liked_firstname = _get_firstname_from_user_id(
            cursor=cursor,
            user_id=user_liked_id
        )
        send_notification(
            sender_id=user_id,
            receiver_id=user_liked_id,
            message=f'Match with {user_liked_firstname}! 💕',
            notification_type='match'
        )
        send_notification(
            sender_id=user_liked_id,
            receiver_id=user_id,
            message=f'Match with {user_firstname}! 💕',
            notification_type='match'
        )
        store_notification(
            cursor=cursor,
            sender_id=user_id,
            receiver_id=user_liked_id,
            message=f'Match with {user_liked_firstname}! 💕',
            notification_type='match'
        )
        store_notification(
            cursor=cursor,
            sender_id=user_liked_id,
            receiver_id=user_id,
            message=f'Match with {user_firstname}! 💕',
            notification_type='match'
        )
        from app.main.views.social import _delete_user_from_redis
        _delete_user_from_redis(
            request_user_id=user_id,
            targer_user_id=user_liked_id
        )
        _delete_user_from_redis(
            request_user_id=user_liked_id,
            targer_user_id=user_id
        )

    except Exception as e:
        raise e


def _get_firstname_from_user_id(
    cursor,
    user_id: int,
) -> str:
    query = """
SELECT
    firstname
FROM
    users
WHERE
    id = %s
    """
    cursor.execute(query, (user_id,))
    result = cursor.fetchone()
    return result['firstname']

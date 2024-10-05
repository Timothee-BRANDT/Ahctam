from functools import wraps
from typing import Dict

import jwt
from flask import current_app, jsonify, request
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from logger import logger


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token_bearer = request.headers.get('Authorization', '')
        if not token_bearer:
            return jsonify({'error': 'Token is missing'}), 400
        token: str = token_bearer.split(' ')[1]
        try:
            jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated


def sender_not_blocked(f):
    @wraps(f)
    def decorated(**kwargs):
        is_blocked_query = """
SELECT *
FROM blocks
WHERE blocker = %s AND user_blocked = %s
        """
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            sender_id: int = int(kwargs.get('sender_id', ''))
            receiver_id: int = int(kwargs.get('receiver_id', ''))
            if not (sender_id and receiver_id):
                raise ValueError('Sender and receiver IDs are required')

            cursor.execute(is_blocked_query, (receiver_id, sender_id))
            is_blocked: bool = cursor.fetchone() is not None
            if is_blocked:
                logger.warn(f'{sender_id} is blocked by {receiver_id}')
                return None

            return f(**kwargs)

        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 400
        finally:
            cursor.close()
            conn.close()

    return decorated

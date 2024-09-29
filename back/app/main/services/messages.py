from datetime import datetime
from typing import Dict, List

import jwt
from flask import current_app, jsonify, request
from psycopg2.extras import RealDictCursor

from app.api.services.user_services import get_user_info
from app.database import get_db_connection
from logger import logger


def store_message(
    cursor,
    sender_id: int,
    message: str,
    match_id: int,
) -> int:
    """
    Store a message in the database
    Use it in a try/except block
    """

    try:
        store_message_query = """
    INSERT INTO messages (sent_at, message, sender_id, match_id)
    VALUES (NOW() AT TIME ZONE 'Europe/Paris', %s, %s, %s)
    RETURNING id
        """
        cursor.execute(
            store_message_query,
            (
                message,
                sender_id,
                match_id,
            )
        )
        logger.info(f"Message stored for {match_id}")
        new_message_id = cursor.fetchone()['id']
        return new_message_id

    except Exception as e:
        raise e


def send_message(
    message_id: int,
    sender_id: int,
    conversation_id: int,
    receiver_id: int,
    message: str,
) -> None:
    """
    Send a notification to a user
    Use it in a try/except block
    """
    try:
        socketio = current_app.extensions['socketio']
        redis_client = current_app.extensions['redis']
        redis_receiver_key: str = f"socket:{receiver_id}"
        receiver_sid = redis_client.get(redis_receiver_key).decode('utf-8')
        print(f"Receiver SID: {receiver_sid}")
        if receiver_sid is not None:
            socketio.emit(
                'new_message',
                {
                    'id': message_id,
                    'match_id': conversation_id,
                    'text': message,
                    'isMe': False,
                    'timestamp': datetime.now().isoformat(),
                },
                room=receiver_sid
            )
            logger.info(f"message sent to {receiver_id}")

    except Exception as e:
        raise e

from flask import current_app, jsonify, request

from .. import main

# from app.authentication.views.decorators import jwt_required


# from app.main.sockets.sockets import


def store_notification(
    cursor,
    sender_id: int,
    receiver_id: int,
    message: str,
    notification_type: str,
) -> None:
    """
    Store a notification in the database
    Use it in a try/except block
    """

    try:
        store_notification_query = """
    INSERT INTO notifications (date, message, type, sender, receiver)
    VALUES (NOW() AT TIME ZONE 'Europe/Paris', %s, %s, %s, %s)
        """
        cursor.execute(
            store_notification_query,
            (
                message,
                notification_type,
                sender_id,
                receiver_id,
            )
        )
    except Exception as e:
        raise e


def send_notification(
    sender_id: int,
    receiver_id: int,
    message: str,
    notification_type: str,
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
                'notification',
                {
                    'message': message,
                    'notification_type': notification_type,
                    'sender_id': sender_id,
                },
                room=receiver_sid
            )

    except Exception as e:
        raise e

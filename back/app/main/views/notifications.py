from flask import current_app, jsonify, request

from .. import main

# from app.authentication.views.decorators import jwt_required


# from app.main.sockets.sockets import


def send_notification(
    cursor,
    sender_id: int,
    receiver_id: int,
    message: str
):
    """
    Send a notification to a user
    """

    # emit a "notification" event to the receiver
    # with the message
    # and the sender's id
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
            },
            room=receiver_sid  # type: ignore
        )
    # TODO: Store the notification in the database
    # for the receiver to see when they log in, if he was offline

from flask import current_app, jsonify, request

from app.authentication.views.decorators import jwt_required

from .. import main


def send_notification(
    cursor,
    sender_id: int,
    receiver_id: int,
    message: str
):
    """
    Send a notification to a user
    """
    pass

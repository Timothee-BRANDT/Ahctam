from flask_socketio import (
    emit,
    send,
    join_room,
    leave_room
)
from app import socketio


@socketio.on('connect')
def handle_connect():
    print('Client connected')

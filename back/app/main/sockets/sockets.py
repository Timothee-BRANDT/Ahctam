from flask_socketio import (
    emit,
    send,
    join_room,
    leave_room
)
from flask import request
from app import socketio
from app.database import get_db_connection
from psycopg2.extras import RealDictCursor


@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')


@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')


@socketio.on('hello')
def handle_hello(data):
    print(f'Received hello from {request.sid}: {data}')
    emit('server_message', {'response': 'Hello from server'})


@socketio.on_error_default
def default_error_handler(e):
    print(f"An error occurred: {str(e)}")
    print(f"Error type: {type(e).__name__}")
    print(f"Error args: {e.args}")

# @socketio.on_error()
# def handle_error(e):
#     print('An error has occurred: ' + str(e))
#
#
# @socketio.on('connect')
# def handle_connect():
#     print('Client connected serverside')
#
#
# @socketio.on('new')
# def handle_status_and_connection(data):
#     print('new event received')
#     user_id = data.get('user_id')
#     # can also use the sid
#     # user_sid = request.sid
#     query = """
# UPDATE Users
# SET status = 'online' last_connexion = NOW()
# WHERE id = %s
#     """
#     conn = get_db_connection()
#     cursor = conn.cursor(cursor_factory=RealDictCursor)
#     try:
#         cursor.execute(query, (user_id,))
#         conn.commit()
#         emit('connected', {'message': f'user {user_id} connected'})
#
#     except Exception as e:
#         emit('error', {'error': str(e)})
#     finally:
#         cursor.close()
#         conn.close()

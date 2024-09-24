from typing import cast

import jwt
from flask import current_app, request
from flask_socketio import emit
from psycopg2.extras import RealDictCursor

from app import socketio
from app.database import get_db_connection


def update_status_and_connection_time(user_id: int, status: str):
    query = """
UPDATE Users
SET status = %s,
    last_connexion = NOW() AT TIME ZONE 'Europe/Paris'
WHERE id = %s
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(query, (status, user_id))
        conn.commit()

    except Exception as e:
        raise e
    finally:
        cursor.close()
        conn.close()


@socketio.on('connect')
def handle_connect():
    print('******************CONNECT*****************************')
    try:
        token: str = request.args.get('token', '')
        if token:
            user = jwt.decode(
                token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = user['id']
            redis_client = current_app.extensions['redis']
            sid = request.sid  # type: ignore
            redis_user_key: str = f"socket:{user_id}"
            redis_client.set(redis_user_key, sid)
            update_status_and_connection_time(user_id, 'online')
            # print(f'Client connected: {sid}')
            print(redis_client.get(redis_user_key))
            print(f'Client connected: {sid}')
            print('******************CONNECT*****************************')
        else:
            print('No token provided')
            return False

    except Exception as e:
        print(f'An error occurred: {str(e)}')
        return False


@socketio.on('disconnect')
def handle_disconnect():
    print('##################DISCONNECT#########################')
    try:
        token: str = request.args.get('token', '')
        if token:
            user = jwt.decode(
                token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = user['id']
            redis_client = current_app.extensions['redis']
            sid = request.sid  # type: ignore
            redis_user_key: str = f"socket:{user_id}"
            redis_client.delete(redis_user_key)
            update_status_and_connection_time(user_id, 'offline')
            print(f'Client disconnected: {sid}')
            print(redis_client.get(redis_user_key))
            print('##################DISCONNECT#########################')
        else:
            print('No token provided')
            return False
    except Exception as e:
        print(f'An error occurred: {str(e)}')
        return False


@socketio.on('hello')
def handle_hello(data):
    sid = request.sid  # type: ignore
    print(f'Received hello from {sid}: {data}')
    emit('server_message', {'response': 'Hello from server'})


@socketio.on_error_default
def default_error_handler(e):
    print(f"An error occurred for sockets: {str(e)}")
    print(f"Socket error type: {type(e).__name__}")
    print(f"Socket error args: {e.args}")

# TODO: - get the token from the client
#       - decode the token (make a function)
#       - get the arguments given with the socket call
#       - link the id with the session id in redis
#       - update the status of the user in the database
#       - send back a message to the client
#       - create a function to handle the disconnection, remove from redis
#       - implement the chat, that connects 2 sessions
#

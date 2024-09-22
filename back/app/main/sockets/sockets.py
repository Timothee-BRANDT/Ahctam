from typing import cast

import jwt
from app import socketio
from app.database import get_db_connection
from flask import current_app, request
from flask_socketio import emit
from psycopg2.extras import RealDictCursor


def update_status_and_connection_time(user_id: int, status: str):
    query = """
UPDATE Users
SET status = %s,
    last_connexion = CURRENT_TIMESTAMP
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
    print('***********************************************')
    try:
        token: str = request.args.get('token', '')
        if token:
            user = jwt.decode(
                token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = user['id']
            redis_client = current_app.extensions['redis']
            sid = request.sid  # type: ignore
            redis_sid_key: str = f"socket_sid:{sid}"
            redis_user_key: str = f"socket:{sid}"
            redis_client.set(redis_sid_key, user_id)
            redis_client.set(redis_user_key, sid)
            update_status_and_connection_time(user_id, 'online')
            # print(f'Client connected: {sid}')
            print(redis_client.get(redis_sid_key))
            print(redis_client.get(redis_user_key))
            print(f'Client connected: {sid}')
            print('***********************************************')
        else:
            print('No token provided')
            return False

    except Exception as e:
        print(f'An error occurred: {str(e)}')
        return False


@socketio.on('disconnect')
def handle_disconnect():
    print('###########################################')
    try:
        token: str = request.args.get('token', '')
        if token:
            user = jwt.decode(
                token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = user['id']
            redis_client = current_app.extensions['redis']
            sid = request.sid  # type: ignore
            redis_sid_key = f"socket_sid:{sid}"
            redis_user_key = f"socket:{user_id}"
            redis_client.delete(redis_sid_key)
            redis_client.delete(redis_user_key)
            update_status_and_connection_time(user_id, 'offline')
            print(f'Client disconnected: {sid}')
            print(redis_client.get(redis_user_key))
            print(redis_client.get(f"socket:{user_id}"))
            print('###########################################')
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

# @socketio.on_error()
# def handle_error(e):
#     print('An error has occurred: ' + str(e))
#
#
# @socketio.on('connect')
# def handle_connect():
#     print('Client connected serverside')
#
# TODO: - get the token from the client
#       - decode the token (make a function)
#       - get the arguments given with the socket call
#       - link the id with the session id in redis
#       - update the status of the user in the database
#       - send back a message to the client
#       - create a function to handle the disconnection, remove from redis
#       - implement the chat, that connects 2 sessions
#

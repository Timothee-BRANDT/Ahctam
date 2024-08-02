import jwt
from flask_socketio import (
    emit,
    # send,
    # join_room,
    # leave_room
)
from flask import (
    request,
    current_app,
    jsonify
)
from app import socketio
from app.database import get_db_connection
from psycopg2.extras import RealDictCursor


def update_status_and_connection_time(user_id):
    query = """
UPDATE Users
SET status = 'online' last_connexion = NOW()
WHERE id = %s
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(query, (user_id,))
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
        token: str = request.args.get('token')
        if token:
            user = jwt.decode(
                token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = user['id']
            redis_client = current_app.extensions['redis']
            redis_sid_key: str = f"socket_sid:{request.sid}"
            redis_user_key: str = f"socket:{user_id}"
            redis_client.set(redis_sid_key, user_id)
            redis_client.set(redis_user_key, request.sid)
            update_status_and_connection_time(user_id)
            print(f'Client connected: {request.sid}')
        else:
            print('No token provided')
            return False

    except Exception as e:
        print(f'An error occurred: {str(e)}')
        return False


@socketio.on('disconnect')
def handle_disconnect():
    redis_client = current_app.extensions['redis']
    redis_user_key = redis_client.get(f"socket_sid:{request.sid}")
    redis_client.delete(f"socket_sid:{request.sid}")
    redis_client.delete(f"socket:{redis_user_key}")
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
# TODO: - get the token from the client
#       - decode the token (make a function)
#       - get the arguments given with the socket call
#       - link the id with the session id in redis
#       - update the status of the user in the database
#       - send back a message to the client
#       - create a function to handle the disconnection, remove from redis
#       - implement the chat, that connects 2 sessions
#

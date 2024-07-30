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
    print('Client connected')
    user_id = request.args.get('user_id')
    # can also use the sid
    # user_sid = request.sid
    query = """
UPDATE Users
SET status = 'online'
WHERE id = %s
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(query, (user_id,))
        conn.commit()
        emit('connected', {'message': f'user {user_id} connected'})

    except Exception as e:
        emit('error', {'error': str(e)})
    finally:
        cursor.close()
        conn.close()

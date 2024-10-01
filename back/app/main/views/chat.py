from typing import Dict, List

import jwt
from flask import current_app, jsonify, request
from psycopg2.extras import RealDictCursor

from app.api.services.user_services import get_user_info
from app.authentication.views.decorators import jwt_required
from app.database import get_db_connection
from app.main import main
from app.main.services.messages import send_message, store_message
from app.main.views.notifications import send_notification, store_notification
from logger import logger


@main.route('/sendMessage', methods=['POST'])
@jwt_required
def send_new_message():
    logger.info("Storing message")
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        data = request.get_json()
        sender_id: int = int(data['useruuid'])
        receiver_id: int = int(data['matchedUseruuid'])
        message: str = data['message']
        match_id: int = int(data['conversationId'])
        logger.info(
            f"Sender: {sender_id}, Receiver: {receiver_id}, Message: {message}, Match ID: {match_id}")
        new_message_id = store_message(
            cursor=cursor,
            sender_id=sender_id,
            message=message,
            match_id=match_id
        )
        send_message(
            message_id=new_message_id,
            conversation_id=match_id,
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message,
        )

        conn.commit()
        return jsonify({'message': 'Message sent'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@main.route('/getMyConversations', methods=['GET'])
@jwt_required
def get_user_matches():
    logger.info("Getting user matches")
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    matches_query = """
SELECT
    u.id,
    u.status,
    m.id AS match_id
FROM users u
JOIN matches m ON u.id = m.user1 OR u.id = m.user2
WHERE (m.user1 = %s OR m.user2 = %s)
AND u.id != %s
    """
    messages_query = """
SELECT *
FROM messages
WHERE match_id = %s
ORDER BY sent_at
    """
    try:
        token = request.headers.get('Authorization', '').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']
        cursor.execute(matches_query, (user_id, user_id, user_id))
        result: List = cursor.fetchall()
        user_matches: Dict = {}
        for element in result:
            user_matches[element['id']] = element['match_id']

        matches_and_messages: List[Dict] = []
        for user_match_id, match_id in user_matches.items():
            user_match, status_code = get_user_info(user_match_id)
            cursor.execute(messages_query, (match_id,))
            messages_query_result: List = [
                dict(message) for message in cursor.fetchall()
            ]
            if status_code == 200:
                matches_and_messages.append({
                    "id": match_id,
                    "useruuid": user_id,
                    "matchedUseruuid": user_match_id,
                    "matchedUserStatus": user_match['status'],
                    "name": user_match['firstname'],
                    "avatar": user_match['photos'][0],
                    "messages": [
                        {
                            "id": message['id'],
                            "text": message['message'],
                            "isMe": message['sender_id'] == user_id,
                            "timestamp": message['sent_at']
                        } for message in messages_query_result
                    ]
                })

        # logger.info(f"Matches and messages: {matches_and_messages}")
        return jsonify(matches_and_messages), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@main.route('/sendNotifMessage', methods=['POST'])
@jwt_required
def send_notif_message():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sender_receiver_from_match_query = """
SELECT
    user1,
    user2
FROM matches
WHERE id = %s
    """
    try:
        data = request.get_json()
        logger.info(f"Data: {data}")
        match_id: int = data['match_id']
        message: str = data['message']
        user = jwt.decode(
            request.headers.get('Authorization', '').split(' ')[1],
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        user_id: int = int(user['id'])

        cursor.execute(sender_receiver_from_match_query, (match_id,))
        result: Dict = dict(cursor.fetchone())
        sender_id: int = result['user1'] if result['user1'] != user_id else result['user2']
        receiver_id: int = result['user1'] if result['user1'] == user_id else result['user2']

        send_notification(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message,
            notification_type='message'
        )
        store_notification(
            cursor=cursor,
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message,
            notification_type='message'
        )

        logger.info(f"Notification message sent: {message}")
        return jsonify({'message': 'Notif message sent'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# What front expects:
# interface Match {
#   id: number;
#   useruuid: number;
#   matchedUseruuid: number;
#   name: string;
#   avatar: string;
#   messages: Message[];
# }
#
# interface Message {
#   id: number;
#   text: string;
#   isMe: boolean;
#   timestamp: string;
# }

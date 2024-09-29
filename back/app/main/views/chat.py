from typing import Dict, List

import jwt
from flask import current_app, jsonify, request
from psycopg2.extras import RealDictCursor

from app.api.services.user_services import get_user_info
from app.authentication.views.decorators import jwt_required
from app.database import get_db_connection
from app.main import main
from logger import logger


@main.route('/getMyConversations', methods=['GET'])
@jwt_required
def get_user_matches():
    logger.info("Getting user matches")
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    matches_query = """
SELECT
    u.id,
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
                    "name": user_match['firstname'],
                    "avatar": user_match['photos'][0],
                    "messages": [
                        {
                            "id": message['id'],
                            "text": message['text'],
                            "isMe": message['sender_id'] == user_id,
                            "timestamp": message['sent_at']
                        } for message in messages_query_result
                    ]
                })

        logger.info(f"Matches and messages: {matches_and_messages}")
        return jsonify(matches_and_messages), 200

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

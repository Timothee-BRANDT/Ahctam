from flask import (
    jsonify,
    request,
    current_app,
)
import jwt
from psycopg2.extras import RealDictCursor
from .. import main
from app.database import get_db_connection
from app.authentication.views.decorators import jwt_required


def get_matching_users(user_data, cursor, offset, limit):
    correct_gender_query = """
SELECT id,
       firstname,
       age,
       biography,
       gender,
       sexual_preferences,
       fame
FROM users
WHERE id != %s
  AND (
        (%s = 'both' AND ((sexual_preferences = 'both') OR (sexual_preferences = %s)))
        OR (gender = %s AND ((sexual_preferences = 'both') OR (sexual_preferences = %s)))
      )
"""

    params = (user_data['id'],
              user_data['sexual_preferences'],
              user_data['gender'],
              user_data['gender'],
              user_data['sexual_preferences'])
    try:
        cursor.execute(correct_gender_query, params)
        matching_users = cursor.fetchall()
        print(matching_users)
    except Exception as e:
        raise Exception(str(e))


@main.route('/browse', methods=['GET'])
@jwt_required
def browse():
    offset = request.args.get('offset', 0)
    limit = request.args.get('limit', 10)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_query = """
SELECT firstname,\
lastname,\
age,\
biography,\
gender,\
sexual_preferences,\
fame
FROM users
WHERE id = %s
        """
        result = cur.execute(user_query, (user['id'],))
        user_data = cur.fetchone()
        matching_users = get_matching_users(user_data, cur, offset, limit)
        print(matching_users)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

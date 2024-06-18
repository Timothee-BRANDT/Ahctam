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
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

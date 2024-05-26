from flask import jsonify
from . import api
from ..database import get_db_connection
from ..authentication.views.decorators import jwt_required


@api.route('/test')
def get_test():
    data = {"message": "Hello World from the API!"}
    return jsonify(data)


@api.route('/interests')
@jwt_required
def get_interests():
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
    SELECT name
    FROM interests
    """
    try:
        cur.execute(query)
        interests = cur.fetchall()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'interests': interests}), 200
    finally:
        cur.close()
        conn.close()

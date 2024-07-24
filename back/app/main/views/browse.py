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
    """
    This endpoint returns a list of users who are not the current user
    It can have query parameters to filter the users
    1) On the first call we will store the result in redis
    2) We will do the pagination from the redis

    Returns: an array of user objects
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    age: int = request.args.get('age')
    fame: int = request.args.get('fame')
    distance: int = request.args.get('distance')
    common_interests: int = request.args.get('tags')
    # NOTE: location, address, town // interests // photos // is_connected
    base_query = """
SELECT
    id,
    username,
    firstname,
    lastname,
    age,
    email,
    fame AS fame_rating,
    is_active,
    is_connected,
    last_connection,
    gender,
    sexual_preferences,
    biography,
    created_at
    """

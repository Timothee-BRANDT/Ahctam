from flask import (
    jsonify,
    request,
)
from psycopg2.extras import RealDictCursor
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


@api.route('/filterUsers', methods=['GET'])
@jwt_required
def get_profiles():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # TODO: What if there is no Filter By ? Do we use our matching algorithm ?
    sort_by = request.args.get('sortBy')
    filter_by = request.args.get('filterBy')
    filter_age = request.args.get('filterAge')
    filter_fame = request.args.get('filterFame')
    filter_location = request.args.get('filterLocation')
    filter_tags = request.args.get('filterTags')
    query = """
    SELECT * FROM users
    WHERE 1 = 1
    """
    params: tuple = ()
    if filter_age:
        query += " AND age = %s"
        params += (filter_age,)
    if filter_fame:
        query += " AND fame = %s"
        params += (filter_fame,)
    if filter_location:
        query += " AND location = %s"
        params += (filter_location,)
    if filter_tags:
        query += " AND tags = %s"
        params += (filter_tags,)
    if sort_by:
        query += " ORDER BY %s"
        params += (sort_by,)

    try:
        cur.execute(query, params)
        profiles = cur.fetchall()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'profiles': profiles}), 200
    finally:
        cur.close()
        conn.close()

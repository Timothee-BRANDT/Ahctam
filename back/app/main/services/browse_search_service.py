import json
from typing import Dict, List, Tuple, Any
##########################################################
from app.database import get_db_connection
from app.main import main
from app.main.services.algo_service import matching_score
# from app.authentication.views.decorators import jwt_required
##########################################################
from flask import current_app, jsonify
from logger import logger
from psycopg2.extras import RealDictCursor


def get_matching_users(
    user_data: Dict,
    cursor,
) -> List[Dict]:
    """
    TODO: Now work on the interests brooo
    It will need another join with the user_interest relation table
    """
    matchers_query = """
    SELECT
        u.id,
        u.firstname,
        u.age,
        u.biography,
        u.gender,
        u.sexual_preferences,
        u.fame,
        l.latitude,
        l.longitude,
        l.city,
        STRING_AGG(i.name, ', ') AS interests
    FROM users u
    JOIN locations l ON u.id = l.located_user
    LEFT JOIN user_interests ui ON u.id = ui.user_id
    LEFT JOIN interests i ON ui.interest_id = i.id
    WHERE u.id != %s
      AND (
            (%s = 'both' AND (u.sexual_preferences = 'both' OR u.sexual_preferences = %s))
            OR (u.gender = %s AND (u.sexual_preferences = 'both' OR u.sexual_preferences = %s))
          )
    GROUP BY
        u.id,
        u.firstname,
        u.age,
        u.biography,
        u.gender,
        u.sexual_preferences,
        u.fame,
        l.latitude,
        l.longitude,
        l.city
    """

    matchers_query_params = (
        user_data["id"],
        user_data["sexual_preferences"],
        user_data["gender"],
        user_data["gender"],
        user_data["sexual_preferences"],
    )

    location_query = """
    SELECT l.latitude AS latitude,
           l.longitude AS longitude,
           l.city AS city,
           STRING_AGG(i.name, ', ') AS interests
    FROM locations l
    LEFT JOIN user_interests ui ON ui.user_id = l.located_user
    LEFT JOIN interests i ON ui.interest_id = i.id
    WHERE located_user = %s
    GROUP BY l.latitude, l.longitude, l.city
    """
    try:
        cursor.execute(location_query, (user_data["id"],))
        location_and_interests: Dict = dict(cursor.fetchone())
        user_data["latitude"] = location_and_interests["latitude"]
        user_data["longitude"] = location_and_interests["longitude"]
        user_data["city"] = location_and_interests["city"]
        user_data["interests"] = location_and_interests["interests"]

        cursor.execute(matchers_query, matchers_query_params)
        matching_users = cursor.fetchall()

        for index, matching_user in enumerate(matching_users):
            matching_user["matching_score"] = matching_score(
                user_data, matching_user)
            logger.info("user_name", matching_user["firstname"])
            logger.info("matching_score", matching_user["matching_score"])
            # TODO: Remove this break
            if index == 10:
                break

        matching_users: List = sorted(
            matching_users,
            key=lambda x: x["matching_score"],
            reverse=True
        )
        return matching_users

    except Exception as e:
        raise Exception(str(e))


@main.route("/test-redis", methods=["GET"])
def test_redis():
    redis_client = current_app.extensions["redis"]
    redis_client.set("test", "coucou")
    test = redis_client.get("test").decode("utf-8")
    return jsonify({"message": test}), 200


def apply_filters(
    matching_users: List[Dict],
    age: int,
    fame: int,
    distance: int,
    common_interests: int,
) -> List[Dict]:
    """
    This function will filter the matching users based on the query parameters
    """
    if age:
        matching_users = [
            user for user in matching_users if user["age"] == age]
    if fame:
        matching_users = [
            user for user in matching_users if user["fame"] == fame]
    if distance:
        matching_users = [
            user for user in matching_users if user["distance"] == distance
        ]
    if common_interests:
        matching_users = [
            user
            for user in matching_users
            if user["common_interests"] == common_interests
        ]

    return matching_users


def perform_browsing(
    filters: bool,
    user_id: int,
    age: int,
    fame: int,
    distance: int,
    common_interests: int,
    offset: int,
    limit: int,
) -> Tuple[Dict, int]:
    """
    Actually it will compute the algorithm every time a user wants to browse
    After talking with collegues, it's the backend job
    We'll use redis to avoid recomputing the algorithm (Bonus)
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    redis_client = current_app.extensions["redis"]
    try:
        user_query = """
SELECT \
id,\
firstname,\
lastname,\
age,\
biography,\
gender,\
sexual_preferences,\
status,\
fame
FROM users
WHERE id = %s
        """
        redis_key: str = f"matching:{user_id}"
        matching_users: List[Dict] = []
        if not redis_client.exists(redis_key):
            logger.info("nothing in redis yet")
            cur.execute(user_query, (user_id,))
            user_data: Dict[str, Any] = dict(cur.fetchone())
            logger.info(f"from db:{user_data=}")
            matching_users = get_matching_users(
                user_data=user_data,
                cursor=cur,
            )
            logger.info("get_matching_users:", matching_users)
            redis_client.set(redis_key, json.dumps(matching_users), ex=3600)
        else:
            logger.info("something in redis")
            matching_users = json.loads(
                redis_client.get(redis_key).decode("utf-8")
            )
            logger.info("matching_users in redis: ", matching_users)

        if filters:
            matching_users = apply_filters(
                matching_users=matching_users,
                age=age,
                fame=fame,
                distance=distance,
                common_interests=common_interests
            )
        return {"users": matching_users[offset:limit]}, 200

    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cur.close()
        conn.close()

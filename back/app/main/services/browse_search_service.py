import json
import numpy as np
from typing import Any, Dict, List, Tuple

# from app.authentication.views.decorators import jwt_required
from flask import current_app, jsonify
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.main import main
from app.main.services.algo_service import (haversine, matching_score,
                                            scale_fame_into_percentiles)
from logger import logger


def _get_matching_users(
    user_data: Dict,
    cursor,
) -> List[Dict]:
    """
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
        u.status,
        l.latitude,
        l.longitude,
        l.city AS town,
        p.url AS photos,
        STRING_AGG(i.name, ', ') AS interests
    FROM users u
    JOIN locations l ON u.id = l.located_user
    LEFT JOIN pictures p ON u.id = p.owner AND p.is_profile_picture = TRUE
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
        u.status,
        l.latitude,
        l.longitude,
        l.city,
        p.url
    """

    matchers_query_params = (
        user_data["id"],
        user_data["sexual_preferences"],
        user_data["gender"],
        user_data["sexual_preferences"],
        user_data["gender"],
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
        matching_users: List = cursor.fetchall()

        for matching_user in matching_users:
            matching_user["matching_score"] = matching_score(
                user_data, matching_user)
            matching_user["latitude"] = float(matching_user["latitude"])
            matching_user["longitude"] = float(matching_user["longitude"])
            matching_user["photos"] = [matching_user["photos"]]
            matching_user["fame"] = scale_fame_into_percentiles(
                cursor, matching_user["fame"])
            matching_user["nb_common_tags"] = _count_common_interests(
                user_data["interests"].split(", "),
                matching_user["interests"].split(", ")
            )
            matching_user["distance"] = np.round(
                haversine(
                    float(user_data["latitude"]),
                    float(user_data["longitude"]),
                    matching_user["latitude"],
                    matching_user["longitude"]
                ),
                2
            )

        matching_users: List = sorted(
            matching_users,
            key=lambda x: x["matching_score"],
            reverse=True
        )
        return matching_users

    except Exception as e:
        raise Exception(str(e))


def _count_common_interests(
    user_interests: List[str],
    matcher_interests: List[str]
) -> int:
    """
    This function will count the common interests between two users
    """
    return len(set(user_interests).intersection(matcher_interests))


def _apply_filters(
    user_data: Dict[str, Any],
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
        min_age: int = user_data["age"] - age
        max_age: int = user_data["age"] + age
        matching_users = [
            user for user in matching_users if (
                user["age"] >= min_age
                and user["age"] <= max_age
            )
        ]
    if fame:
        matching_users = [
            user
            for user in matching_users
            if user["fame"] >= fame
        ]
    if distance:
        matching_users = [
            user
            for user in matching_users
            if (
                haversine(
                    user_data["latitude"],
                    user_data["longitude"],
                    user["latitude"],
                    user["longitude"]
                ) <= distance
            )
        ]
    if common_interests:
        user_interests_list: List[str] = user_data["interests"].split(", ")
        matching_users = [
            user
            for user in matching_users
            if _count_common_interests(
                user_interests_list,
                user["interests"].split(", ")
            ) >= common_interests
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
) -> Tuple[List, int, int]:
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
u.id,\
u.firstname,\
u.lastname,\
u.age,\
u.biography,\
u.gender,\
u.sexual_preferences,\
u.status,\
u.fame,\
l.latitude,\
l.longitude,\
STRING_AGG(i.name, ', ') AS interests
FROM users u
JOIN locations l ON u.id = l.located_user
LEFT JOIN user_interests ui ON u.id = ui.user_id
LEFT JOIN interests i on ui.interest_id = i.id
WHERE u.id = %s
GROUP BY
    u.id,
    u.firstname,
    u.lastname,
    u.age,
    u.biography,
    u.gender,
    u.sexual_preferences,
    u.status,
    u.fame,
    l.latitude,
    l.longitude
        """
        redis_key: str = f"matching:{user_id}"
        matching_users: List[Dict] = []
        cur.execute(user_query, (user_id,))
        user_data: Dict[str, Any] = dict(cur.fetchone())
        user_data["longitude"] = float(user_data["longitude"])
        user_data["latitude"] = float(user_data["latitude"])
        if not redis_client.exists(redis_key):
            logger.info("nothing in redis yet")
            matching_users = _get_matching_users(
                user_data=user_data,
                cursor=cur,
            )
            redis_client.set(redis_key, json.dumps(matching_users), ex=3600)
        else:
            logger.info("something in redis")
            matching_users = json.loads(
                redis_client.get(redis_key).decode("utf-8")
            )

        if filters:
            matching_users = _apply_filters(
                user_data=user_data,
                matching_users=matching_users,
                age=age,
                fame=fame,
                distance=distance,
                common_interests=common_interests
            )
        return matching_users[offset:limit], len(matching_users), 200

    except Exception as e:
        raise e
    finally:
        cur.close()
        conn.close()

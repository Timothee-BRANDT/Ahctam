from typing import Any, Dict, List, Tuple

import jwt
from app.authentication.views.decorators import jwt_required
from app.main import main
from app.main.services.browse_search_service import perform_browsing
from flask import Response, current_app, jsonify, request
from logger import logger


@main.route("/browse", methods=["GET"])
@jwt_required
def browse() -> Tuple[Response, int]:
    """
    Returns: a Response with an array of user objects
    Only what is necessary for the card display
    """
    try:
        filter_args = ["age", "fame", "distance", "tags"]
        filters: bool = True if any(
            arg in request.args for arg in filter_args) else False

        age: int = int(request.args.get("age", 0))
        fame: int = int(request.args.get("fame", 0))
        distance: int = int(request.args.get("distance", 0))
        common_interests: int = int(request.args.get("tags", 0))
        offset: int = int(request.args.get("offset", 0))
        limit: int = int(request.args.get("limit", 9))
        token: str = request.headers.get("Authorization", "").split(" ")[1]
        user: Dict[str, Any] = jwt.decode(
            token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
        user_id: int = int(user["id"])
        response: List
        status_code: int
        response, status_code = perform_browsing(
            filters=filters,
            user_id=user_id,
            age=age,
            fame=fame,
            distance=distance,
            common_interests=common_interests,
            offset=offset,
            limit=limit,
        )
        return jsonify(response), status_code

    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"message": "Error"}), 500

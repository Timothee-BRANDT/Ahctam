from typing import Any
import requests
import jwt
from flask import Response, current_app, jsonify, request

from app.authentication.views.decorators import jwt_required
from app.main import main
from app.main.services.browse_search_service import perform_browsing
from logger import logger


@main.route("/imgur", methods=["GET"])
@jwt_required
def get_imgur_images() -> tuple[Response, int]:
    """
    """
    try:
        search_term: str = request.args.get("search_term", "")
        if not search_term:
            raise Exception("No search term provided")

        imgur_client_id: str = current_app.config["IMGUR_CLIENT_ID"]
        url: str = f"https://api.imgur.com/3/gallery/search/?q={search_term}"
        response = requests.get(
            url=url,
            headers={"Authorization": f"{imgur_client_id}"},
        )
        if response.status_code != 200:
            raise Exception("Imgur error fetching images")

        return jsonify(response.json()), 200

    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"message": str(e)}), 500

from typing import Dict, Any
from flask import (
    request,
    jsonify,
    current_app,
    Response
)
import jwt
from app.main import main
from app.authentication.views.decorators import jwt_required
from app.main.services.browse_search_service import perform_browsing
from logger import logger


@main.route('/browse', methods=['GET'])
@jwt_required
def browse() -> Response:
    """
    Returns: a Response with an array of user objects
    Only what is necessary for the card display
    """
    try:
        filter_args = ['age', 'fame', 'distance', 'tags']
        filters: bool = False
        if any(arg in request.args for arg in filter_args):
            logger.info('Filtering')
            filters = True

        age: int = int(request.args.get('age', 0))
        fame: int = int(request.args.get('fame', 0))
        distance: int = int(request.args.get('distance', 0))
        common_interests: int = int(request.args.get('tags', 0))
        offset: int = int(request.args.get('offset', 0))
        limit: int = int(request.args.get('limit', 9))
        logger.info(f'Offset: {offset}')
        logger.info(f'Limit: {limit}')
        token: str = request.headers.get('Authorization', '').split(' ')[1]
        user: Dict[str, Any] = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']
        response_dict: Dict
        status_code: int
        response_dict, status_code = perform_browsing(
            filters=filters,
            user_id=user_id,
            age=age,
            fame=fame,
            distance=distance,
            common_interests=common_interests,
            offset=offset,
            limit=limit
        )
        return jsonify(response_dict), status_code

    except Exception as e:
        logger.error(f'Error: {e}')
        return jsonify({'message': 'Error'}), 500

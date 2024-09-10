from flask import (
    request,
    jsonify,
    current_app,
)
from typing import Dict
import jwt
from app.main import main
from app.authentication.views.decorators import jwt_required
from app.main.services.browse_search_service import perform_browsing
from logger import logger


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
    try:
        filter_args = ['age', 'fame', 'distance', 'tags']
        filters: bool = False
        if any(arg in request.args for arg in filter_args):
            logger.info('Filtering')
            filters = True

        age: int = request.args.get('age')
        fame: int = request.args.get('fame')
        distance: int = request.args.get('distance')
        common_interests: int = request.args.get('tags')
        offset: int = int(request.args.get('offset', 0))
        limit: int = int(request.args.get('limit', 9))
        logger.info(f'Offset: {offset}')
        logger.info(f'Limit: {limit}')
        token = request.headers.get('Authorization').split(' ')[1]
        user = jwt.decode(
            token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user['id']
        response: Dict
        status_code: int
        response, status_code = perform_browsing(
            filters=filters,
            user_id=user_id,
            age=age,
            fame=fame,
            distance=distance,
            common_interests=common_interests,
            offset=offset,
            limit=limit
        )
        return jsonify({'message': 'Hello'}), 200

    except Exception as e:
        logger.error(f'Error: {e}')
        return jsonify({'message': 'Error'}), 500

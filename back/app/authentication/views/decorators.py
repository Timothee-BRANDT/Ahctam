import jwt
from functools import wraps
from flask import (
    request,
    jsonify,
    current_app
)


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        print('the token is', token)
        if not token:
            return jsonify({'error': 'Token is missing'}), 400
        try:
            jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms='HS256'
            )
        except Exception as e:
            return jsonify({'error': str(e)}), 400
        return f(*args, **kwargs)
    return decorated

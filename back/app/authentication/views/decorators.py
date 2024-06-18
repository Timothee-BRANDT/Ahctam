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
        token_bearer = request.headers.get('Authorization')
        if not token_bearer:
            return jsonify({'error': 'Token is missing'}), 400
        token = token_bearer.split(' ')[1]
        print(token)
        try:
            jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

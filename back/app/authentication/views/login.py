from typing import Dict, Any, Tuple
from .. import auth
from ..forms import (
    LoginForm,
    FirstLoginForm,
)
from datetime import datetime, timedelta, timezone
from logger import logger
from flask import (
    Response,
    current_app,
    request,
    redirect,
    url_for,
    jsonify,
)
from werkzeug.security import generate_password_hash
from werkzeug.wrappers import Response as WerkzeugResponse
from psycopg2.extras import RealDictCursor
import jwt
from datetime import datetime, timedelta
from ...database import get_db_connection
from .decorators import jwt_required
from .utils import (
    store_first_login_informations,
)


global_nonce = ''


@auth.route('/login', methods=['POST'])
def login() -> Tuple[Response, int]:
    """
    The login route used to authenticate the user.

    Args:
    -----
    None

    Request:
    --------
    {
        "username": "username",
        "password": "password"
    }

    Returns:
    --------
    {
        "message": "Login successful" or "First login",
        "jwt_token": "token",
        "refresh_token": "refresh_token",
        "user_id": int
    }, status_code

    Raises:
    -------
    ValueError: "Invalid credentials"
    ValueError: "User is not active"
    """
    data = request.get_json()
    form = LoginForm(data=data)
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        form.validate()

        cur.execute('SELECT is_active FROM users WHERE username = %s',
                    (data['username'],))
        is_active = cur.fetchone()[0]
        if not is_active:
            raise Exception('User is not active')

        cur.execute('SELECT id FROM users WHERE username = %s',
                    (data['username'],))
        user_id = cur.fetchone()[0]

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        # WARNING: 30 days of token for tests, change to 1 hour in production
        jwt_token = jwt.encode({
            'id': user_id,
            'username': data['username'],
            'exp': datetime.utcnow() + timedelta(days=30)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        refresh_token = jwt.encode({
            'id': user_id,
            'username': data['username'],
            'exp': datetime.utcnow() + timedelta(days=30)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        query = """
INSERT INTO refresh_tokens (token, user_id, expiration_date)
VALUES (%s, %s, %s)
"""
        cur.execute(query, (refresh_token, user_id,
                    datetime.utcnow() + timedelta(days=30)))
        conn.commit()
        # We use gender to check if the user has already completed his profile
        cur.execute('SELECT gender FROM users WHERE id = %s',
                    (user_id,))

        gender = cur.fetchone()[0]
        if not gender:
            return jsonify({
                'message': 'First login',
                'jwt_token': jwt_token,
                'refresh_token': refresh_token,
                'user_id': user_id
            }), 200

        update_last_connexion_query = """
UPDATE users
SET last_connexion = %s
WHERE id = %s
        """
        cur.execute(update_last_connexion_query, (datetime.utcnow(), user_id))
        conn.commit()

        return jsonify({
            'message': 'Login successful',
            'jwt_token': jwt_token,
            'refresh_token': refresh_token,
            'user_id': user_id
        }), 200
    finally:
        cur.close()
        conn.close()


@auth.route('/first-login', methods=['POST'])
def first_login():
    # NOTE:  Put jwt_required
    logger.info(request.headers)
    connector = get_db_connection()
    cursor = connector.cursor(cursor_factory=RealDictCursor)
    try:
        data = request.get_json()
        payload: Dict = data.get('payload', {})
        token = payload.get('token', '')
        if token == '':
            raise Exception('No token provided')
        user: Dict[str, Any] = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        user_id = user['id']
        user_ip = request.remote_addr
        logger.info(f'{user_ip=}')
        logger.info(f'{type(user_ip)=}')
        form: FirstLoginForm = FirstLoginForm(data=payload)
        form.validate()

        store_first_login_informations(
            connector,
            cursor,
            form,
            user_id,
            user_ip
        )
        return jsonify({'message': 'First login successful'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        connector.close()


@auth.route('/logout', methods=['POST'])
@jwt_required
def logout():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        decoded_refresh_token = jwt.decode(
            refresh_token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        user_id = decoded_refresh_token['id']
        query = """
DELETE FROM refresh_tokens
WHERE user_id = %s
AND token = %s
        """
        cur.execute(query, (user_id, refresh_token))

        conn.commit()
        return jsonify({'message': 'Logout successful'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@auth.route('/refresh', methods=['POST'])
def refresh():
    """
    If 401, we must logout the user
    """
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        decoded_refresh_token = jwt.decode(
            refresh_token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        print(decoded_refresh_token)
        user_id = decoded_refresh_token['id']
        query = """
SELECT * FROM refresh_tokens
WHERE user_id = %s
AND token = %s
AND expiration_date > %s
        """
        cur.execute(query,
                    (user_id, refresh_token, datetime.utcnow()))
        token_record = cur.fetchone()
        if not token_record:
            raise Exception('Invalid or expired refresh token')

        new_jwt_token = jwt.encode({
            'id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Refresh token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid refresh token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({
        'jwt_token': new_jwt_token
    }), 200


@auth.route('/google/login')
def google_login():
    print('google login')
    from app import oauth
    global_nonce = _generate_nonce()
    google = oauth.google
    if not google:
        return redirect('http://localhost:3000')
    redirect_uri = url_for('auth.google_callback', _external=True)

    return google.authorize_redirect(
        redirect_uri,
        nonce=global_nonce
    )


@auth.route('/google/callback')
def google_callback() -> WerkzeugResponse:
    from app import oauth
    is_user_registered_query = """
SELECT *
FROM users 
WHERE username = %s
"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    jwt_token: str = ''
    try:
        google = oauth.google
        if not google:
            raise Exception('Google oauth not configured')

        google_token = google.authorize_access_token()
        google_user_info: Dict = google.parse_id_token(
            google_token,
            nonce=global_nonce
            # nonce=session.get('nonce')
        )
        username: str = str(google_user_info.get('sub', ''))

        cur.execute(is_user_registered_query, (username,))
        is_user_registered = cur.fetchone()

        id: int = is_user_registered['id'] \
            if is_user_registered else _register_google_user(google_user_info)
        jwt_token = jwt.encode(
            {
                'id': id,
                'username': username,
                'exp': datetime.now(tz=timezone.utc) + timedelta(days=30)
            },
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        # If not registered or profile not completed yet
        if is_user_registered is None or not is_user_registered['gender']:
            return redirect(
                f'http://localhost:3000/first-login?token={jwt_token}')

        return redirect('http://localhost:3000?token=' + jwt_token)

    except Exception as e:
        logger.error(e)
        return redirect('http://localhost:3000')


def _generate_nonce():
    import random
    import string
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))


def _register_google_user(google_user_info: Dict) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        register_query = """
INSERT INTO users (username, password, email, firstname, lastname, is_active)
VALUES (%s, %s, %s, %s, %s, TRUE)
RETURNING id
"""
        print('coucou register google')
        cursor.execute(
            register_query,
            (
                google_user_info['sub'],
                generate_password_hash(
                    current_app.config['OAUTH_DEFAULT_PASSWORD']),
                google_user_info['email'],
                google_user_info['given_name'],
                google_user_info['family_name']
            )
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        logger.info(f'User {user_id} registered via google!')
        return user_id

    except Exception as e:
        raise e
    finally:
        cursor.close()
        conn.close()

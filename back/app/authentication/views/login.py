from .. import auth
from ..forms import (
    LoginForm,
    InformationsForm,
)
from flask import (
    current_app,
    render_template,
    request,
    jsonify,
)
import jwt
from datetime import datetime, timedelta
from ...database import get_db_connection
from .decorators import jwt_required
from .utils import store_profile_informations


@auth.route('/login', methods=['POST'])
def login():
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
    finally:
        cur.close()
        conn.close()
    return jsonify({
        'message': 'Login successful',
        'jwt_token': jwt_token,
        'refresh_token': refresh_token,
        'user_id': user_id
    }), 200


@auth.route('/update-profile', methods=['POST'])
def first_login():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        data = request.get_json()
        profile = data.get('payload', {})
        print(f'Profile: {profile}')
        user_id = profile.get('id')
        form = InformationsForm(data=profile)
        form.validate()
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        store_profile_informations(conn, cur, form, user_id)
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'First login successful'}), 200


@auth.route('/first-login', methods=['GET'])
def first_login_page():
    context = {
        'form': InformationsForm()
    }
    return render_template('first-login.html', **context), 200


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
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({'message': 'Logout successful'}), 200


@auth.route('/protected', methods=['GET'])
@jwt_required
def test_protected():
    return jsonify({
        'message': 'Hello protected route'
    }), 200


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

from .. import auth
from ..forms import LoginForm
from flask import (
    current_app,
    render_template,
    request,
    jsonify,
)
import jwt
from datetime import datetime, timedelta
from ...database import get_db_connection


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
        jwt_token = jwt.encode({
            'id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        cur.execute('SELECT gender FROM users WHERE id = %s',
                    (user_id,))
        gender = cur.fetchone()[0]
        if not gender:
            return jsonify({
                'message': 'First login',
                'jwt_token': jwt_token
            }), 200
    finally:
        cur.close()
        conn.close()
    return jsonify({
        'message': 'Login successful',
        'jwt_token': jwt_token
    }), 200


@auth.route('/login', methods=['GET'])
def login_page():
    context = {
        'form': LoginForm()
    }
    return render_template('login.html', **context), 200


@auth.route('/logout', methods=['GET'])
def logout():
    pass
    # TODO: Add JWT token logout
    return jsonify({'message': 'Logout successful'}), 200

from .. import auth
from flask import (
    # current_app,
    render_template,
    request,
    jsonify,
    session
)
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)
from itsdangerous import (
    URLSafeTimedSerializer,
    SignatureExpired,
    BadSignature
)
from ..forms import LoginForm
from ...database import get_db_connection
from .utils import send_reset_password_email


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    form = LoginForm(data=data)
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        form.validate()
        cur.execute('SELECT password, id FROM users WHERE username = %s',
                    (data['username'],))
        user = cur.fetchone()
        if not check_password_hash(user[0], form.password.data):
            raise ValueError('Invalid password')
        session['id'] = user[1]
        session['username'] = data['username']
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Login successful'}), 200


@auth.route('/login', methods=['GET'])
def login_page():
    print('login_page')
    context = {
        'form': LoginForm()
    }
    return render_template('login.html', **context), 200


@auth.route('/forgot_password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        print('Data here is ', data)
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT username FROM users WHERE email = %s',
                    (data['email'],))
        user = cur.fetchone()
        if not user:
            raise ValueError('Email does not exist')
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        send_reset_password_email(data['email'])
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Email sent'}), 200


@auth.route('/forgot_password', methods=['GET'])
def forgot_password_page():
    return render_template('forgot_password.html'), 200


@auth.route('/reset_password/<token>', methods=['POST'])
def reset_password(token):
    try:
        serializer = URLSafeTimedSerializer(auth.config['SECRET_KEY'])
        email = serializer.loads(token, salt=auth.config['SMTP_SECURITY_SALT'],
                                 max_age=3600)
    except SignatureExpired:
        return jsonify({'error': 'Token expired'}), 400
    except BadSignature:
        return jsonify({'error': 'Invalid token'}), 400
    else:
        data = request.get_json()
        if data['password'] != data['password2']:
            return jsonify({'error': 'Passwords do not match'}), 400
        hash = generate_password_hash(data['password'])
        conn = get_db_connection()
        cur = conn.cursor()
        query = 'UPDATE users SET password = %s WHERE email = %s'
        cur.execute(query, (hash, email))
        conn.commit()
    finally:
        cur.close()
        conn.close()


@auth.route('/reset_password', methods=['GET'])
def reset_password_page():
    return render_template('reset_password.html'), 200

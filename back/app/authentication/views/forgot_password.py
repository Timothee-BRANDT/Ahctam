from .. import auth
from flask import (
    current_app,
    render_template,
    request,
    jsonify,
)
from itsdangerous import (
    URLSafeTimedSerializer,
    SignatureExpired,
    BadSignature
)
from ..forms import ResetPasswordForm
from werkzeug.security import generate_password_hash
from ...database import get_db_connection
from .utils import send_reset_password_email

@auth.route('/forgot_password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT email FROM users WHERE username = %s',
                    (data,))
        email = cur.fetchone()
        if not email:
            raise ValueError('Email does not exist')
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        send_reset_password_email(email)
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Email sent'}), 200


@auth.route('/forgot_password', methods=['GET'])
def forgot_password_page():
    return render_template('forgot_password.html'), 200


@auth.route('/reset_password/<token>', methods=['POST'])
def reset_password(token):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        email = serializer.loads(token,
                                 salt=current_app.config['SMTP_SECURITY_SALT'],
                                 max_age=3600)
        data = request.get_json()
        form = ResetPasswordForm(data=data)
        form.validate()
    except SignatureExpired:
        return jsonify({'error': 'Token expired'}), 400
    except BadSignature:
        return jsonify({'error': 'Invalid token'}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    else:
        if data['password'] != data['password2']:
            return jsonify({'error': 'Passwords do not match'}), 400
        hash = generate_password_hash(data['password'])
        query = 'UPDATE users SET password = %s WHERE email = %s'
        cur.execute(query, (hash, email))
        conn.commit()
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Password reset successfully'}), 200


@auth.route('/reset_password', methods=['GET'])
def reset_password_page():
    context = {
        'form': ResetPasswordForm(),
    }
    return render_template('reset_password.html', **context), 200

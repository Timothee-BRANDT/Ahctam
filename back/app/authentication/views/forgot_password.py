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
    conn = get_db_connection()
    cur = conn.cursor()
    email_query = 'SELECT email FROM users WHERE username = %s'
    try:
        data = request.get_json()
        cur.execute(email_query, (data,))
        email = cur.fetchone()[0]
        if not email:
            raise ValueError('Email does not exist')

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    else:
        send_reset_password_email(email)
        return jsonify({'message': 'Email sent'}), 200
    finally:
        cur.close()
        conn.close()


@auth.route('/forgot_password', methods=['GET'])
def forgot_password_page():
    return render_template('forgot_password.html'), 200


@auth.route('/reset_password', methods=['POST'])
def reset_password():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        data = request.get_json()
        token = data['token']
        email = serializer.loads(
            token,
            salt=current_app.config['SMTP_SECURITY_SALT'],
            max_age=3600
        )
        form = ResetPasswordForm(data=data)
        form.validate()
    except SignatureExpired:
        return jsonify({'error': 'Token expired'}), 400
    except BadSignature:
        return jsonify({'error': 'Invalid token'}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    else:
        if data['password'] != data['confirmPassword']:
            return jsonify({'error': 'Passwords do not match'}), 400
        hash = generate_password_hash(data['password'])
        query = 'UPDATE users SET password = %s WHERE email = %s'
        cur.execute(query, (hash, email))

        conn.commit()
        return jsonify({'message': 'Password reset successfully'}), 200
    finally:
        cur.close()
        conn.close()


@auth.route('/reset_password', methods=['GET'])
def reset_password_page():
    context = {
        'form': ResetPasswordForm(),
    }
    return render_template('reset_password.html', **context), 200

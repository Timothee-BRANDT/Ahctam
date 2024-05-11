from .. import auth
from flask import (
    # current_app,
    render_template,
    request,
    jsonify,
    session
)
from werkzeug.security import (
    # generate_password_hash,
    check_password_hash
)
from ..forms import LoginForm
from ...database import get_db_connection


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
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('SELECT email FROM users WHERE username = %s',
                    (session['username'],))
        email = cur.fetchone()[0]
        if email != data['email']:
            raise ValueError('Invalid email address')
        # send email
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Email sent'}), 200


@auth.route('/forgot_password', methods=['GET'])
def forgot_password_page():
    return render_template('forgot_password.html'), 200

# auth.route('/logout', methods=['POST'])

from .. import auth
from flask import (
    # current_app,
    render_template,
    request,
    jsonify
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
        cur.execute('SELECT password FROM users WHERE username = %s',
                    (data['username'],))
        user = cur.fetchone()
        if not check_password_hash(user[0], form.password.data):
            raise ValueError('Invalid password')
        # Here we handle the login
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

# auth.route('/logout', methods=['POST'])

from flask import (
    Blueprint,
    render_template,
    request,
    jsonify
)
from werkzeug.security import (
    generate_password_hash,
    # check_password_hash
)
from .forms import RegisterForm
from ..database import get_db_connection

main = Blueprint('main', __name__)


@main.route('/')
def home():
    return render_template('index.html')


@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    form = RegisterForm(data=data)
    try:
        form.validate()
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    username = data['username']
    password = data['password']
    email = data['email']
    hashed_password = generate_password_hash(password)

    sql = "INSERT INTO users (username, password, email) VALUES (%s, %s, %s)"
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(sql, (username, hashed_password, email))
        conn.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Registration successful'})


@main.route('/register', methods=['GET'])
def register_page():
    context = {
        'form': RegisterForm()
    }
    return render_template('register.html', **context)

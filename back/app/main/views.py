from flask import (
    Blueprint,
    current_app,
    render_template,
    request,
    jsonify
)
from werkzeug.security import (
    generate_password_hash,
    # check_password_hash
)
from itsdangerous import (
    URLSafeTimedSerializer,
)
from .utils import send_confirmation_email
from .forms import RegisterForm
from ..database import get_db_connection

main = Blueprint('main', __name__)


@main.route('/')
def home():
    return render_template('index.html')


@main.route('/confirm_email/<token>', methods=['GET'])
def confirm_email(token):
    return jsonify({'message': 'Email confirmed'}), 200


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

    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    token = serializer.dumps(
        email, salt=current_app.config['SMTP_SECURITY_SALT'])

    sql = """
INSERT INTO users (username, password, email) VALUES (%s, %s, %s)
    """
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(sql, (username, hashed_password, email))
        conn.commit()
        send_confirmation_email(email, token)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Registration successful'}), 200


@main.route('/register', methods=['GET'])
def register_page():
    context = {
        'form': RegisterForm()
    }
    return render_template('register.html', **context), 200

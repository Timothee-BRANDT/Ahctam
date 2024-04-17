from flask import (
    Blueprint,
    render_template,
    request,
    jsonify
)
import os
from ..database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

main = Blueprint('main', __name__)


@main.route('/')
def home():
    return render_template('index.html')


@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    email = data['email']
    hashed_password = generate_password_hash(password)
    sql = "INSERT INTO users (username, password, email) VALUES (%s, %s, %s)"

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(sql, (username, hashed_password, email))
        conn.commit()
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        cur.close()
        conn.close()
    return jsonify({'message': 'Registration successful'})

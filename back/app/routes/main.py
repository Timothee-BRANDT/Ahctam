from flask import (
    Blueprint,
    render_template,
    request,
    jsonify
)
import os
import psycopg2
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

    try:
        conn = psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host='localhost',
            port='5432'
        )
        cursor = conn.cursor()
        # We parametrize the query to prevent SQL injection
        sql = f"INSERT INTO users (username, password, email) VALUES (%s, %s, %s)"

        cursor.execute(sql, (username, hashed_password, email))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Registration successful'})

    except Exception as e:
        return jsonify({'error': str(e)})

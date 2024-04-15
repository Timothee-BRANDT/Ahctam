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
        query = '''
        INSERT INTO users (username, email, password_hash)
        VALUES (%s, %s, %s)
        '''
        cur = conn.cursor()
        cur.execute(query, (username, email, hashed_password))
        conn.commit()
        cur.close()
        conn.close()
    # return jsonify({'username': username, 'password': hashed_password})
    except Exception as e:
        return jsonify({'error': str(e)})


def login():
    pass

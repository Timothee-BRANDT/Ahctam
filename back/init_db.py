import psycopg2
import sys
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# TODO: Move those to .env in the future
DATABASE = 'matcha_db'
USER = 'matcha_user'
PASSWORD = 'msp'
HOST = 'localhost'
PORT = '5432'


def init_db():
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute(sql.SQL('CREATE DATABASE {}').format(
            sql.Identifier(DATABASE)))
        cur.close()
        conn.close()
    except Exception as e:
        print(e)
        sys.exit(1)


def create_user_table():
    try:
        conn = psycopg2.connect(
            dbname=DATABASE,
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT
        )
        cur = conn.cursor()
        query = '''
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT FALSE,
            registration_token VARCHAR(255) UNIQUE,
            jwt_token VARCHAR(255),
            gender VARCHAR(20),
            sexual_preferencees VARCHAR(50) NOT NULL,
            biography TEXT,
            interests TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
        cur.execute(query)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(e)
        sys.exit(1)


if __name__ == '__main__':
    init_db()
    create_user_table()

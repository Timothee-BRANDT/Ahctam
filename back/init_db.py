import psycopg2
import os
from dotenv import load_dotenv
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from flask import current_app

load_dotenv()


def init_db():
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            # user=current_app.config['POSTGRES_USER'],
            # password=current_app.config['POSTGRES_PASSWORD'],
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute(sql.SQL('CREATE DATABASE {}').format(
            sql.Identifier(os.getenv('POSTGRES_DB'))))
        # cur.execute(sql.SQL('CREATE DATABASE {}').format(
        #    sql.Identifier(current_app.config['POSTGRES_DB'])))
        print('Database created successfully')
        cur.close()
        conn.close()
    except Exception as e:
        print(e)


def create_user_table(config=None):
    try:
        conn = psycopg2.connect(
            # dbname=current_app.config['POSTGRES_DB'],
            # user=current_app.config['POSTGRES_USER'],
            # password=current_app.config['POSTGRES_PASSWORD'],
            dbname=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host='localhost',
            port='5432'
        )
        cur = conn.cursor()
        query = '''
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT FALSE,
            gender VARCHAR(20),
            sexual_preferencees VARCHAR(50),
            biography TEXT,
            interests TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
        cur.execute(query)
        print('Table users created successfully')
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(e)


if __name__ == '__main__':
    init_db(app=False)
    create_user_table(app=False)

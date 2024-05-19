from flask import current_app
import psycopg2


def get_db_connection():
    config = {
        'dbname': current_app.config['POSTGRES_DB'],
        'user': current_app.config['POSTGRES_USER'],
        'password': current_app.config['POSTGRES_PASSWORD'],
        'host': 'localhost',
        'port': '5432'
    }
    return psycopg2.connect(**config)

import os
import psycopg2


def get_db_connection(config=None):
    if config is None:
        config = {
            'dbname': os.getenv('POSTGRES_DB'),
            'user': os.getenv('POSTGRES_USER'),
            'password': os.getenv('POSTGRES_PASSWORD'),
            'host': 'localhost',
            'port': '5432'
        }
    return psycopg2.connect(**config)

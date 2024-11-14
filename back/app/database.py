from flask import current_app
import psycopg2
from psycopg2.extensions import connection


def get_db_connection() -> connection:
    config: dict[str, str] = {
        'dbname': current_app.config['POSTGRES_DB'],
        'user': current_app.config['POSTGRES_USER'],
        'password': current_app.config['POSTGRES_PASSWORD'],
        'host': 'db',
        'port': '5432'
    }
    return psycopg2.connect(**config)  # pyright: ignore

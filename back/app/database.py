from flask import current_app
import psycopg2
from psycopg2.extensions import connection


def get_db_connection() -> connection:
    config: dict[str, str] = {
        'dbname': current_app.config['POSTGRES_DB'],
        'user': current_app.config['POSTGRES_USER'],
        'password': current_app.config['POSTGRES_PASSWORD'],
        'host': 'localhost',
        'port': '5433'
    }
    return psycopg2.connect(**config)  # pyright: ignore

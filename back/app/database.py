import os
import psycopg2
from flask import current_app


def get_db_connection():
    if current_app.config['TESTING']:
        from unittest.mock import MagicMock
        mock_conn = MagicMock()
        mock_cursor = mock_conn.cursor.return_value
        mock_cursor.fetchone.return_value = None
        mock_cursor.fetchall.return_value = []
        mock_cursor.execute.return_value = None
        return mock_conn
    else:
        return psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host='localhost',
            port='5432'
        )

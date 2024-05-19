import pytest
from app import create_app
from app.database import get_db_connection
from init_db import init_db, create_user_table


@pytest.fixture(scope='session')
def app():
    app = create_app(test_config=True)

    with app.app_context():
        init_db()
        create_user_table()

    yield app


@pytest.fixture(scope='function', autouse=True)
def clean_db(app):
    yield
    with app.app_context():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM users')
        conn.commit()
        cur.close()
        conn.close()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


# @pytest.fixture(autouse=True)
# def clean_db():
#     yield
#     conn = get_db_connection()
#     cur = conn.cursor()
#     cur.execute('DELETE FROM users')
#     conn.commit()
#     cur.close()
#     conn.close()

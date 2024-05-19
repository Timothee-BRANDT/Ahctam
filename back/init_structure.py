import os
import sys

if not os.path.exists('.env'):
    print("""
    No .env file found, create one with:
    POSTGRES_DB=<your_db_name>
    POSTGRES_USER=<your_db_user>
    POSTGRES_PASSWORD=<your_db_password>

    FRONTEND_URL='http://localhost:3000'
    BACKEND_URL='http://localhost:5000'
    LOG_FILE='/var/log/<your_app_name>'

    SECRET_KEY=<your_secret_key>
    JWT_SECRET_KEY=<your_jwt_secret_key>

    SMTP_HOST='smtp.gmail.com'
    SMTP_PORT=587
    SMTP_USER='<your_email>@gmail.com'
    SMTP_PASSWORD=<your_email_smtp_password>
        """)
    sys.exit(1)


def write_file(path, content):
    with open(path, 'w') as file:
        file.write(content)


content_app_py = """from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
"""

content_init_py = """import os
from flask import Flask
from dotenv import load_dotenv
from .main.views import main as main_blueprint
from .api.views import api as api_blueprint

load_dotenv()

def create_app():
    app = Flask(__name__, template_folder='../templates')

    app.register_blueprint(main_blueprint)
    app.register_blueprint(api_blueprint, url_prefix='/api')

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['WTF_CSRF_SECRET'] = os.getenv('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    return app
"""

get_db_connection = """
import os
import psycopg2


def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host='localhost',
        port='5432'
    )
"""


os.makedirs('app/main', exist_ok=True)
write_file('app/main/__init__.py', '')
write_file('app/main/views.py', '')
write_file('app/main/database.py', get_db_connection)
os.makedirs('app/api', exist_ok=True)
write_file('app/api/__init__.py', '')
write_file('app/api/views.py', '')
os.makedirs('app/static/assets', exist_ok=True)
os.makedirs('app/static/css', exist_ok=True)
os.makedirs('app/static/js', exist_ok=True)
os.makedirs('app/templates', exist_ok=True)
os.makedirs('app/tests', exist_ok=True)
write_file('app/__init__.py', content_init_py)
print('modular app directory created')

write_file('app.py', content_app_py)
print('app.py created')

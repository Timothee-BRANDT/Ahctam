import os
from flask import Flask
from dotenv import load_dotenv
from .routes.main import main as main_blueprint
from .routes.api import api as api_blueprint

load_dotenv()


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'secret key from .env'
    app.config['WTF_CSRF_SECRET'] = 'same secret key from .env'

    app.register_blueprint(main_blueprint)
    app.register_blueprint(api_blueprint, url_prefix='/api')

    # Global secret key for the app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    # JWT secret key
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')


    return app

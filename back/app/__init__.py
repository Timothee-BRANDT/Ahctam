import os
from flask import Flask
from dotenv import load_dotenv
from .main.views import main as main_blueprint
from .api.views import api as api_blueprint

load_dotenv()


def create_app(test_config=None):
    app = Flask(__name__, template_folder='../templates')

    app.register_blueprint(main_blueprint)
    app.register_blueprint(api_blueprint, url_prefix='/api')

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['WTF_CSRF_SECRET'] = os.getenv('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    if test_config is not None:
        app.config.update(test_config)
    else:
        app.config['DATABASE'] = os.getenv('POSTGRES_DB')

    return app

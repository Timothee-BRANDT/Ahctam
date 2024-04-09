from flask import Flask
from .routes.main import main as main_blueprint
from .routes.api import api as api_blueprint


def create_app():
    app = Flask(__name__)

    app.register_blueprint(main_blueprint)
    app.register_blueprint(api_blueprint, url_prefix='/api')

    return app

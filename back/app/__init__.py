from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from config import (
    DevelopmentConfig,
    TestingConfig,
    ProductionConfig
)
from app.main import main as main_blueprint
from app.api import api as api_blueprint
from app.authentication import auth as auth_blueprint


def create_app(test_config=False, production=False):
    app = Flask(__name__, template_folder='../templates')

    if production is True:
        app.config.from_object(ProductionConfig)
    elif test_config is True:
        app.config.from_object(TestingConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    app.register_blueprint(main_blueprint)
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    app.register_blueprint(api_blueprint, url_prefix='/api')

    CORS(app, supports_credentials=True)
    Mail(app)

    return app

from flask import (
    Flask,
    redirect,
    url_for,
)
from flask_cors import CORS
from flask_mail import Mail
from flask_redis import FlaskRedis
from flask_socketio import SocketIO
from config import (
    DevelopmentConfig,
    TestingConfig,
    ProductionConfig
)
from authlib.integrations.flask_client import OAuth
from app.main import main as main_blue
from app.api import api as api_blue
from app.authentication import auth as auth_blue


socketio = SocketIO()
oauth = OAuth()


def create_app(test_config=False, production=False):
    app = Flask(__name__, template_folder='../templates')

    if production is True:
        app.config.from_object(ProductionConfig)
    elif test_config is True:
        app.config.from_object(TestingConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    app.register_blue
    app.register_blue
    app.register_blue

    CORS(
        app,
        supports_credentials=True,
        allow_credentials=True,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://front:3000",
                    "http://nginx:1111",
                    "http://localhost:1111",

                ],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "expose_headers": ["Content-Range", "X-Content-Range"]
            }
        },
    )

    Mail(app)

    redis_client = FlaskRedis(app)
    redis_client.init_app(app)

    oauth.init_app(app)

    oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid profile email',
            'prompt': 'select_account',
        },
    )

    socketio.init_app(app, cors_allowed_origins="*")
    from app.main.sockets import sockets

    return app

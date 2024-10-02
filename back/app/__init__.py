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
from app.main import main as main_blueprint
from app.api import api as api_blueprint
from app.authentication import auth as auth_blueprint


socketio = SocketIO()


def create_app(test_config=False, production=False):
    app = Flask(__name__, template_folder='../templates')

    if production is True:
        app.config.from_object(ProductionConfig)
    elif test_config is True:
        app.config.from_object(TestingConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    app.register_blueprint(main_blueprint, url_prefix='/')
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    app.register_blueprint(api_blueprint, url_prefix='/api')

    CORS(
        app,
        supports_credentials=True,
        allow_credentials=True,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:3000",
                ]
            }
        },
    )

    Mail(app)

    redis_client = FlaskRedis(app)
    redis_client.init_app(app)

    oauth = OAuth()
    oauth.init_app(app)

    oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        authorize_url='https://accounts.google.com/o/oauth2/auth',
        access_token_url='https://accounts.google.com/o/oauth2/token',
        access_token_params=None,
        refresh_token_url='https://accounts.google.com/o/oauth2/token',
        redirect_uri='http://localhost:5000/auth/google/callback',
        client_kwargs={'scope': 'openid profile email'},
    )

    socketio.init_app(app, cors_allowed_origins="*")
    from app.main.sockets import sockets

    return app

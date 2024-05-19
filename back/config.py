import os


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SESSION_COOKIE_SAMESITE = 'Lax'
    WTF_CSRF_SECRET = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SMTP_SECURITY_SALT = os.getenv('SMTP_SECURITY_SALT')
    POSTGRES_DB = os.getenv('POSTGRES_DB')
    POSTGRES_USER = os.getenv('POSTGRES_USER')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
    DB_HOST = 'localhost'
    DB_PORT = 5432
    MAIL_SERVER = os.getenv('SMTP_HOST')
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_PORT = os.getenv('SMTP_PORT')
    MAIL_USERNAME = os.getenv('SMTP_USER')
    MAIL_PASSWORD = os.getenv('SMTP_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('SMTP_USER')
    ENV = os.getenv('FLASK_ENV')


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    POSTGRES_DB = 'test_db'


class ProductionConfig(Config):
    POSTGRES_DB = os.getenv('POSTGRES_PROD_DB')
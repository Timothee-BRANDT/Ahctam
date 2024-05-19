from flask import Blueprint

auth = Blueprint('auth', __name__)

from .views import (
    register,
    login,
    forgot_password,
)

from flask import Blueprint

api = Blueprint('api', __name__)

from .views import get_test

from flask import Blueprint

main = Blueprint('main', __name__)

from .views.views import main

from flask import Blueprint

main = Blueprint('main', __name__)

from .views import (
    social,
    views,
    browse,
    update_profile,
    notifications,
    chat,
)

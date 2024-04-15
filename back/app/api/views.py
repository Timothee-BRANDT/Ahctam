from flask import Blueprint, jsonify

api = Blueprint('api', __name__)


@api.route('/test')
def get_test():
    data = {"message": "Hello, World from the API!"}
    return jsonify(data)

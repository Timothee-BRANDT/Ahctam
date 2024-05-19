from flask import jsonify
from . import api


@api.route('/test')
def get_test():
    data = {"message": "Hello, World from the API!"}
    return jsonify(data)

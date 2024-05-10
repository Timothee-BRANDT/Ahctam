from .. import main
from flask import render_template


@main.route('/', methods=['GET'])
def home():
    return render_template('index.html')

from .. import main
from flask import render_template


@main.route('/', methods=['GET'])
def home():
    context = {
        'username': 'Useless test'
    }
    return render_template('index.html', **context)

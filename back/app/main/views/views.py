from .. import main
from flask import render_template, session


@main.route('/', methods=['GET'])
def home():
    username = session.get('username')
    context = {
        'username': username
    }
    return render_template('index.html', **context)

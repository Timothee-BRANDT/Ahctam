from flask import Flask

app = Flask(__name__)


@app.route('/')
def index():
    return 'This is the Index'


@app.route('/hello')
def hello():
    return 'Hello from the other side'

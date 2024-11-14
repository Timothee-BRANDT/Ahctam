import logging
from app import create_app, socketio
from dotenv import load_dotenv
load_dotenv()

logging.getLogger('socketio').setLevel(logging.DEBUG)
logging.getLogger('engineio').setLevel(logging.DEBUG)

app = create_app()

if __name__ == '__main__':
    # socketio.run(app, debug=True)
    socketio.run(
        app,
        allow_unsafe_werkzeug=True,
        host='0.0.0.0',
        port=5000
    )

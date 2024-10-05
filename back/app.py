from app import create_app, socketio
from dotenv import load_dotenv
load_dotenv()

import logging
logging.getLogger('socketio').setLevel(logging.DEBUG)
logging.getLogger('engineio').setLevel(logging.DEBUG)

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True)

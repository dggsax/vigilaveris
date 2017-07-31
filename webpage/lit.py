from flask import Flask, render_template, session, request, make_response, json, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room,close_room, rooms, disconnect

#Start up Flask server:
app = Flask(__name__, template_folder = './',static_url_path='/static')
app.config['SECRET_KEY'] = 'secret!' #shhh don't tell anyone. Is a secret
thread = None

# Startup has occured
@app.route('/')
def index():
    print("Yo! Welcome, homeslice")

if __name__ == '__main__':
    socketio.run(app, port=3000, debug=True)





















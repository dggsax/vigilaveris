
#Copyright (c) 2017 Joseph D. Steinmeyer (jodalyst)
#Permission is hereby granted, free of charge, to any person obtaining a copy
#  of this software and associated documentation files (the "Software"), to deal 
#  in the Software without restriction, including without limitation the rights to use, 
#  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
#  Software, and to permit persons to whom the Software is furnished to do so, subject 
#  to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies 
# or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
# PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE 
# OR OTHER DEALINGS IN THE SOFTWARE.

#questions? email me at jodalyst@mit.edu


import time
import math
from threading import Thread, Lock
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room,close_room, rooms, disconnect
import pyaudio
import numpy as np
# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on available packages.
#async_mode = 'threading'
#async_mode = 'eventlet'
async_mode = None
if async_mode is None:
    try:
        import eventlet
        async_mode = 'eventlet'
    except ImportError:
        pass

    if async_mode is None:
        try:
            from gevent import monkey
            async_mode = 'gevent'
        except ImportError:
            pass

    if async_mode is None:
        async_mode = 'threading'

    print('async_mode is ' + async_mode)

# monkey patching is necessary because this application uses a background
# thread
if async_mode == 'eventlet':
    import eventlet
    eventlet.monkey_patch()
elif async_mode == 'gevent':
    from gevent import monkey
    monkey.patch_all()

#Start up Flask server:
app = Flask(__name__, template_folder = './',static_url_path='/static')
app.config['SECRET_KEY'] = 'secret!' #shhh don't tell anyone. Is a secret
socketio = SocketIO(app, async_mode = async_mode)
thread = None

def micThread():
    # First time setup
    first_time = True
    if ( first_time ):
        wow = SpectrumAnalyzer()
        first_time = False

    # Etc
    unique = 456
    burst_duration = 1
    counter = 0
    toggle_count = 500
    on_state = True
    while True:
        counter +=1
        if counter%burst_duration == 0:
            socketio.emit('update_{}'.format(unique+1),wow.fft(),broadcast =True)
        if counter%toggle_count == 0:
            counter = 0
            if on_state:
                print("OFF")
            else:
                print("ON")
            on_state = not on_state
        
        time.sleep(0.001)


class SpectrumAnalyzer:
    # Start Pyaudio
    p = pyaudio.PyAudio()

    # Select Device
    device = p.get_device_info_by_host_api_device_index(0, 0)

    # Device Specs
    CHUNK = 1024
    CHANNELS = int(device['maxInputChannels'])
    FORMAT = pyaudio.paFloat32
    RATE = int(device['defaultSampleRate'])
    START = 0
    N = CHUNK

    wave_x = 0
    wave_y = 0
    spec_x = 0
    spec_y = 0
    data = []

    def __init__(self):
        self.pa = pyaudio.PyAudio()
        self.stream = self.pa.open(
            format = self.FORMAT,
            channels = self.CHANNELS, 
            rate = self.RATE,
            input = True,
            output = False,
            input_device_index = 0,
            frames_per_buffer = self.CHUNK)
    #     #Main Loop
    #     self.loop()

    # def loop(self):
    #     try:
    #         while True :
    #             self.data = self.audioinput()
    #             self.fft()

    #     except KeyboardInterrupt:
    #         self.pa.close()
    #     print("End...")

    def audioinput(self):
        data = np.fromstring(self.stream.read(self.CHUNK),dtype=np.float32)
        # ret = self.stream.read(self.CHUNK)
        # ret = np.fromstring(ret, dtype=np.float32)
        return data

    def fft(self):
        self.data = self.audioinput()
        self.wave_x = range(self.START, self.START + self.N)
        self.wave_y = self.data[self.START:self.START + self.N]
        self.spec_x = np.fft.fftfreq(self.N, d = 1.0 / self.RATE)  
        y = np.fft.fft(self.data[self.START:self.START + self.N])    
        self.spec_y = [np.sqrt(c.real ** 2 + c.imag ** 2) for c in y]
        return self.spec_y



@app.route('/')
def index():
    global thread
    print ("A user connected")
    if thread is None:
        thread = Thread(target=micThread)
        thread.daemon = True
        thread.start()
    return render_template('microphone.html')


if __name__ == '__main__':
    socketio.run(app, port=3000, debug=True)
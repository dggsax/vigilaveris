from math import log10
import matplotlib.pyplot as plt
import numpy as np
import pyaudio

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
        # Main loop
        self.loop()

    def loop(self):
        try:
            while True :
                self.data = self.audioinput()
                self.fft()
                # self.graphplot()
                print(self.spec_y)

        except KeyboardInterrupt:
            self.pa.close()
        print("End...")

    def audioinput(self):
        data = np.fromstring(self.stream.read(self.CHUNK),dtype=np.float32)
        # ret = self.stream.read(self.CHUNK)
        # ret = np.fromstring(ret, dtype=np.float32)
        return data

    def fft(self):
        self.wave_x = range(self.START, self.START + self.N)
        self.wave_y = self.data[self.START:self.START + self.N]
        self.spec_x = np.fft.fftfreq(self.N, d = 1.0 / self.RATE)  
        y = np.fft.fft(self.data[self.START:self.START + self.N])    
        self.spec_y = [np.sqrt(c.real ** 2 + c.imag ** 2) for c in y]

if __name__ == "__main__":
    spec = SpectrumAnalyzer()
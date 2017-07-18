import pyaudio
import pprint
# Start Pyaudio
p = pyaudio.PyAudio()
print(p.get_host_api_count())
for i in range(p.get_host_api_info_by_index(0)['deviceCount']):
    # Select Device
    device = p.get_device_info_by_host_api_device_index(0, i)
    pprint.pprint(device)
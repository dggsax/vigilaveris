import time
from flask import Flask, make_response
app = Flask(__name__)

@app.route("/simple.png")
def simple():
    import datetime
    # import StringIO
    import io
    import random

    from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
    from matplotlib.figure import Figure
    from matplotlib.dates import DateFormatter

    try:
        while True:
            fig=Figure()
            ax=fig.add_subplot(111)
            x=[]
            y=[]
            now=datetime.datetime.now()
            delta=datetime.timedelta(days=1)
            for i in range(10):
                x.append(now)
                now+=delta
                y.append(random.randint(0, 1000))
            ax.plot_date(x, y, '-')
            ax.xaxis.set_major_formatter(DateFormatter('%Y-%m-%d'))
            fig.autofmt_xdate()
            canvas=FigureCanvas(fig)
            # png_output = StringIO.StringIO()
            png_output = io.BytesIO()
            canvas.print_png(png_output)
            response=make_response(png_output.getvalue())
            response.headers['Content-Type'] = 'image/png'
            return response
            time.sleep(.01)
            fig.cla()
    except:
        print('welp')

if __name__ == "__main__":
    app.run()
"""


locally, can either run this file (b/c of the app.run call in main), or:
>> export FLASK_APP=sandbox.py
>> python -m flask run
"""

import os
from flask import Flask, render_template, redirect, url_for
from data import now, generate_plot, download_data

app = Flask(__name__)

def get_plot_path(filename, plot_dir='plots'):
    """Generate paths from file name

    Plot files located like: static/plots/image.png
    
    Returns:
     * file_path : relative on disk, like "static/plots/x.png"
     * url : url in flask, like "/static/plots/x.png"

    """
    plot_path = os.path.join(plot_dir, filename)
    file_path = os.path.join(app.static_folder, plot_path)
    url = url_for('static', filename=plot_path)
    return file_path, url

def get_data_path(filename, data_dir='data'):
    data_path = os.path.join(data_dir, filename)
    file_path = os.path.join(app.static_folder, data_path)
    return file_path

@app.route('/')
def home_page():
    return f'Click <a href="{url_for("covid_page")}">here</a> to go to data page.'

@app.route('/data/')
def covid_page():
    data_path = get_data_path('excess_mortality.csv')
    download_data(data_path)

    img_path, img_url = get_plot_path('plot0.png')
    img_w, img_h = 1400, 400
    generate_plot(img_path, data_path, width=img_w, height=img_h)

    return render_template('data_display_page.html',
            home_link=url_for('home_page'),
            date_generated=now(),
            img_url=img_url,
            img_w=img_w,
            img_h=img_h,
            )

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
    

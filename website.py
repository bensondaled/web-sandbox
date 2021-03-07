"""
locally, can either run this file (b/c of the app.run call in main), or:
>> FLASK_APP=website.py FLASK_ENV=development flask run

in browser:
    right click > inspect - click network tab - check "Disable cache"
"""

import os
from flask import Flask, render_template, redirect, url_for
from data import download_data, process_data

app = Flask(__name__)

def get_data_path(filename, data_dir='data'):
    data_path = os.path.join(data_dir, filename)
    file_path = os.path.join(app.static_folder, data_path)
    url = url_for('static', filename=data_path)
    return file_path, url

@app.route('/')
def main_page():
    
    raw_data_path, _ = get_data_path('raw_data.csv')
    download_data(raw_data_path)

    processed_data_path, data_url = get_data_path('processed_data.csv')
    process_data(raw_data_path, processed_data_path)

    return render_template('n_plots.html',
            plot_names=['2016','2017','2018'],
            data_url=data_url,
            )

if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
    

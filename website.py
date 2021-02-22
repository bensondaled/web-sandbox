"""
page:
    http://bendeverett.pythonanywhere.com/
flask:
    https://flask.palletsprojects.com/en/1.1.x/quickstart/
jinja:
    https://codeburst.io/jinja-2-explained-in-5-minutes-88548486834e
    https://jinja.palletsprojects.com/en/2.11.x/templates/


locally, can either run this file (b/c of the app.run call in main), or:
>> export FLASK_APP=sandbox.py
>> python -m flask run
"""

import os
from flask import Flask, render_template, redirect, url_for
from data import now, generate_plot

app = Flask(__name__)

@app.route('/')
def home_page():
    return f'Click <a href="{url_for("covid_page")}">here</a> to go to data page.'

@app.route('/data/')
def covid_page():
    plot_path = url_for('static', filename='plot0.png')
    generate_plot(plot_path)
    full_plot_path = plot_path

    return render_template('data_display_page.html',
            home_link=url_for('home_page'),
            date_generated=now(),
            img_path=full_plot_path,
            )

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
    

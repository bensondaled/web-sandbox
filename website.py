"""
locally, can either run this file (b/c of the app.run call in main), or:
>> FLASK_APP=website.py FLASK_ENV=development flask run

in browser:
    right click > inspect - click network tab - check "Disable cache"
    
logging:
    app.logger.info('')

db_pswd = 'L@nDb4T1m3'

on pythonanywhere virtualenv of interest: needed "pip install mysql-connector-python"
"""

import os
from flask import Flask, render_template, redirect, url_for, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["DEBUG"] = True

SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
    username="bendeverett",
    password="L@nDb4T1m3",
    hostname="bendeverett.mysql.pythonanywhere-services.com",
    databasename="bendeverett$log",
)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_POOL_RECYCLE"] = 299
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app) # to make this db: in ipython3.7 console: from website import db; db.create_all()

class MyItem(db.Model):
    __tablename__ = "log"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(4096))

def get_data_path(filename, data_dir='data'):
    data_path = os.path.join(data_dir, filename)
    file_path = os.path.join(app.static_folder, data_path)
    url = url_for('static', filename=data_path)
    return file_path, url

def get_shared_kw():
    menu_options={'Home': url_for('main_page'),
                  'Add new': url_for('add_new_page'),
                  'Log': url_for('log_page'),
                  'Plots': url_for('plots_page')}
                  
    return dict(menu_options=menu_options)

@app.route('/', methods=['GET'])
def main_page():
    return render_template('home.html',
            **get_shared_kw(),
            )

@app.route('/addnew', methods=['GET'])
def add_new_page():
    if request.method == 'GET':
        return render_template('addnew.html',
                **get_shared_kw())
    
@app.route('/addnew_', methods=['POST'])
def add_new():
    data_in = request.form['patient_id']
    data_in = MyItem(content=data_in)
    db.session.add(data_in)
    db.session.commit()
    return redirect(url_for('log_page'))

@app.route('/log')
def log_page():
    return render_template('log.html',
            data=MyItem.query.all(),
            **get_shared_kw(),
            )

@app.route('/plots')
def plots_page():

    processed_data_path, data_url = get_data_path('processed_data.csv')

    return render_template('plots.html',
            data_url=data_url,
            **get_shared_kw(),
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
    

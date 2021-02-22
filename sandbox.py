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

from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def home_page():
    return render_template('test_template.html', dummy='banana')

@app.route('/covid/')
def covid_page():
    return 'a different page'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
    

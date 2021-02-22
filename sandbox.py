"""
export FLASK_APP=sandbox.py
python -m flask run
"""

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

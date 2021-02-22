"""
can either run this file (because of the app.run call in main), or:

export FLASK_APP=sandbox.py
python -m flask run
"""

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
    

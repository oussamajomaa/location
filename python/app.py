from flask import Flask,render_template,url_for,request
from flask_cors import CORS
import json

import re
import pandas as pd
import spacy
# from spacy.lang.fr.examples import sentences 
from spacy import displacy
# nlp = spacy.load('en_core_web_sm')
# import en_core_web_sm
import fr_core_news_md

nlp = fr_core_news_md.load()
app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    results = []
    wikitext = nlp(request.args.get('text'))
    for word in wikitext.ents:
        item = {
            'word':word.text,
            'label':word.label_
        }
        results.append(item)
        print(word.text,word.label_)
    
    return json.dumps(results)



@app.route('/process')
def process():
    text = request.args.get('text')
    results = []
    for word in wikitext.ents:
        item = {
            'word':word.text,
            'label':word.label_
        }
        results.append(item)
        print(word.text,word.label_)
    
    return text




if __name__ == '__main__':
	app.run(debug=True)
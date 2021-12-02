# from flask import Flask,render_template,url_for,request


# from flask_cors import CORS, cross_origin
# import json

# import re
# import pandas as pd
# import spacy
# # from spacy.lang.fr.examples import sentences 
# from spacy import displacy
# # nlp = spacy.load('en_core_web_sm')
# # import en_core_web_sm
# import fr_core_news_md

# nlp = fr_core_news_md.load()
# app = Flask(__name__)
# cors = CORS(app, resources={r"/*": {"origins": "*"}})

# @app.route('/text')
# def index():
#     results = []
#     wikitext = nlp(request.args.get('text'))
#     for word in wikitext.ents:
#         item = {
#             'word':word.text,
#             'label':word.label_
#         }
        
#         results.append(item)
#         print(word.text)
    
#     return json.dumps(results)



# @app.route('/file', methods=['POST'])
# def process():
#     if request.method == 'POST':
#         print(request.method)
#         # FileStorage object wrapper
#         # file = request.files["file"] 
#         # if file:
#         #     print(file.filename)




# if __name__ == '__main__':
# 	app.run(debug=True)

import os
from os.path import join, dirname, realpath
from flask import Flask, flash, request, redirect, url_for,render_template,abort
from werkzeug.utils import secure_filename
import glob
import zipfile

from flask_cors import CORS, cross_origin
import json
import spacy
from spacy.lang.fr.examples import sentences 
#from spacy import displacy

# nlp = spacy.load("fr_core_news_sm")
import fr_core_news_md

nlp = fr_core_news_md.load()
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['UPLOAD_EXTENSIONS'] = ['.txt', '.zip']
app.config['UPLOAD_PATH'] = 'uploads'


@app.route('/text')
def index():
    results = []
    print(request.args.get('text'))
    wikitext = nlp(request.args.get('text'))
    for word in wikitext.ents:
        item = {
            'word':word.text,
            'label':word.label_
        }

        results.append(item)
        print(word.text)
    
    return json.dumps(results)



@app.route('/file', methods=['POST'])
def process():
    uploaded_file = request.files['file']
    print("uploaded_file is "+str(uploaded_file) )
    filename = secure_filename(uploaded_file.filename)
    if filename != '':
        file_ext = os.path.splitext(filename)[1]
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            abort(400)
        
        # save file to folder
        uploaded_file.save(os.path.join(app.config['UPLOAD_PATH'], filename))

        # Get the base of path
        baseUrl = os.path.dirname(os.path.abspath(__file__))
        
        # Test if a zip file and extract all in uploads folder
        if file_ext == ".zip":
            print("file_ext ******** " + file_ext)
            with zipfile.ZipFile(baseUrl+"/uploads/"+filename, 'r') as zip_ref:
                zip_ref.extractall(baseUrl+"/uploads/")
            
            # Assign extracted files in variable array
            extractedFiles = glob.glob(baseUrl+"/uploads/*.txt")
            print(extractedFiles)
            results = []
            for extractedFile in extractedFiles:
                print(extractedFile)
                f = open(extractedFile, "r")
                contents = f.readlines()
                contents = " ".join(contents)
                wikitext = nlp(contents)
                for word in wikitext.ents:
                    item = {
                        'fileName':extractedFile,
                        'word':word.text,
                        'label':word.label_
                    }
                    results.append(item)

            for extractedFile in extractedFiles:
                os.remove(extractedFile)
        
        if file_ext == ".txt":
            f = open(baseUrl+"/uploads/"+filename, "r")
            print(baseUrl)
            contents = f.readlines()
            # transform list into string
            contents = " ".join(contents)
            results = []
            wikitext = nlp(contents)
            for word in wikitext.ents:
                item = {
                    'fileName':filename,
                    'word':word.text,
                    'label':word.label_
                }

                results.append(item)
                print(word.text)

        os.remove(baseUrl+"/uploads/"+filename)
    return json.dumps(results)
    
    # return json.dumps(contents)


@app.route('/read')
def readFile():
    
    f = open("/home/osm/Bureau/location/python/uploads/test.txt", "r")
    contents = f.readlines()
    print(f.readlines())
    print(contents)
    contents = " ".join(contents)
    return json.dumps(contents)
        





     
       




if __name__ == '__main__':
    app.run(debug=True)
        # from waitress import serve
        # serve(app, host="0.0.0.0", port=5000)
        # app.run(debug=True)


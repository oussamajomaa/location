# Difference
from spacy.lang.fr.examples import sentences 
import fr_core_news_md
nlp = fr_core_news_md.load()
# ###

import os
from flask import Flask, flash, request, redirect, url_for,render_template,abort
from werkzeug.utils import secure_filename
import glob
import zipfile
from flask_cors import CORS, cross_origin
import json

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['UPLOAD_EXTENSIONS'] = ['.txt', '.zip']
app.config['UPLOAD_PATH'] = 'uploads'



    # os.remove(f)

@app.route('/text')
def index():
    results = []
    print(request.args.get('text'))
    wikitext = nlp(request.args.get('text'))
    for word in wikitext.ents:
        item = {
            'city':word.text,
            'label':word.label_
        }
        if word.label_ == "LOC":
            results.append(item)

    return json.dumps(results)



@app.route('/file', methods=['POST'])
def process():
    # Get the base of path
    baseUrl = os.path.dirname(os.path.abspath(__file__))
    
    # Delete existing files
    files = glob.glob(baseUrl+"/uploads/*")
    for f in files:
        os.remove(f)
        print('the file '+f+' has been deleted!!!')

        
    uploaded_file = request.files['file']
    filename = secure_filename(uploaded_file.filename)
    if filename != '':
        file_ext = os.path.splitext(filename)[1]
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            abort(400)
        
        # save file to folder
        uploaded_file.save(os.path.join(app.config['UPLOAD_PATH'], filename))

        


        # Test if a zip file and extract all in uploads folder
        if file_ext == ".zip":
            print("file_ext ******** " + file_ext)
            with zipfile.ZipFile(baseUrl+"/uploads/"+filename, 'r') as zip_ref:
                zip_ref.extractall(baseUrl+"/uploads/")
            
            # Assign extracted files in variable array
            extractedFiles = glob.glob(baseUrl+"/uploads/*.txt")
            print("extracted files " + str(extractedFiles))
            results = []
            for extractedFile in extractedFiles:
                f = open(extractedFile, "r")
                contents = f.readlines()

                # Lire la première ligne du texte et récupérer la date en ignorant la case sensitive
                if 'date' in contents[0]:
                    # .strip() to remove space before and after string
                    fileDate = contents[0].split(":")[1].strip()
                else:
                    fileDate = "1900"
                print(fileDate)
                if len(contents) > 1:
                    if 'titre' in contents[1]:
                        title = contents[1].split(":")[1].strip()
                    else:
                        title = extractedFile
                    print(title)
                else:
                    title = extractedFile

                contents = " ".join(contents)
                wikitext = nlp(contents)
                for word in wikitext.ents:
                    item = {
                        'fileDate':fileDate,
                        'fileName':title,
                        'city':word.text,
                        'label':word.label_
                    }
                    
                    if word.label_ == "LOC":
                        results.append(item)
                        # print(word.text)

            for extractedFile in extractedFiles:
                os.remove(extractedFile)
        
        if file_ext == ".txt":
            f = open(baseUrl+"/uploads/"+filename, "r")
            print(baseUrl)
            contents = f.readlines()

             # Lire la première ligne du texte et récupérer la date en ignorant la case sensitive
            if 'date' in contents[0]:
                # .strip() to remove space before and after string
                fileDate = contents[0].split(":")[1].strip()
            else:
                fileDate = "1900"
            print(fileDate)

            if len(contents) > 1:
                if 'titre' in contents[1]:
                    # .strip() to remove space before and after string
                    title = contents[1].split(":")[1].strip()
                else:
                    title = filename
                print(title)
            else:
                title = filename

            # transform list into string
            contents = " ".join(contents)
            results = []
            wikitext = nlp(contents)
            for word in wikitext.ents:
                item = {
                    'fileDate':fileDate,
                    'fileName':title,
                    'city':word.text,
                    'label':word.label_
                }

                if word.label_ == "LOC":
                    results.append(item)
                    # print(word.text)


        os.remove(baseUrl+"/uploads/"+filename)
    return json.dumps(results)
    


if __name__ == '__main__':
    app.run(debug=True)
        # from waitress import serve
        # serve(app, host="0.0.0.0", port=5000)
        # app.run(debug=True)


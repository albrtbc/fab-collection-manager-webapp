import sqlite3
import re
import csv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

def db_query(query, params=()):
    conn = sqlite3.connect('cards.db')
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    result = cursor.fetchall()
    conn.close()
    return result

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    conn = sqlite3.connect('cards.db')
    cursor = conn.cursor()

    uploaded_file = request.files['file']

    if uploaded_file.filename != '':
        file_path = secure_filename(uploaded_file.filename)
        uploaded_file.save(file_path)

        with open(file_path, 'r') as f:
            reader = csv.reader(f)
            next(reader)  # Saltar la primera fila (cabeceras)
            cursor.execute("DELETE FROM cards")
            for row in reader:
                cursor.execute("INSERT INTO cards (collection, number, name, pitch, card_type, language) VALUES (?, ?, ?, ?, ?, ?)", (row[0], row[1], row[2], row[3], row[4], row[5]))

        conn.commit()
        conn.close()

        # Eliminar el archivo CSV
        os.remove(file_path)

    return jsonify({'message': 'CSV subido correctamente'})


@app.route('/cards', methods=['GET'])
def get_cards():
    name = request.args.get('name', '')
    pitch = request.args.get('pitch', 'N/A')  # 'N/A' pitch no definido

    query = """SELECT SUM(number), collection, name, pitch, card_type, language
               FROM cards WHERE name LIKE ?"""
    params = ['%' + name + '%']

    if pitch != 'N/A':
        query += " AND LOWER(Pitch) = LOWER(?)"
        params.append(pitch)

    query += " GROUP BY number, name, pitch, collection"

    cards = db_query(query, params)
    formatted_cards = [{"count": card[0], "collection": card[1], "name": card[2], "pitch": card[3], "type": card[4], "language": card[5]} for card in cards]

    return jsonify(formatted_cards)

if __name__ == '__main__':
    app.run(debug=True)


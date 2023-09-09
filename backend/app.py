import sqlite3
import csv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

current_directory = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_directory, 'cards.db')


def create_table_if_not_exists():
    create_table_query = '''CREATE TABLE IF NOT EXISTS cards(
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                collection TEXT,
                                number TEXT,
                                name TEXT,
                                pitch TEXT,
                                card_type TEXT,
                                language TEXT
                            );'''
    with db_connection() as conn:
        if conn is not None:
            cursor = conn.cursor()
            cursor.execute(create_table_query)
            conn.commit()


def db_connection():
    try:
        conn = sqlite3.connect(db_path)
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None


def db_query(query, params=()):
    with db_connection() as conn:
        if conn is not None:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            result = cursor.fetchall()
            return result
        else:
            return None


@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'message': 'No file provided'}), 400

    file_path = secure_filename(uploaded_file.filename)
    uploaded_file.save(file_path)

    try:
        with db_connection() as conn:
            cursor = conn.cursor()
            with open(file_path, 'r') as f:
                reader = csv.reader(f)
                next(reader)  # Skip the first row (headers)
                cursor.execute("DELETE FROM cards")
                for row in reader:
                    cursor.execute(
                        "INSERT INTO cards (collection, number, name, pitch, card_type, language) VALUES (?, ?, ?, ?, ?, ?)",
                        (row[0], row[1], row[2], row[3], row[4], row[5]))
            conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'CSV processing error'}), 500
    finally:
        os.remove(file_path)

    return jsonify({'message': 'CSV uploaded successfully'})


@app.route('/cards', methods=['GET'])
def get_cards():
    name = request.args.get('name', '')
    pitch = request.args.get('pitch', 'N/A')  # 'N/A' undefined pitch

    query = """SELECT SUM(number), collection, name, pitch, card_type, language
               FROM cards WHERE name LIKE ?"""
    params = ['%' + name + '%']

    if pitch != 'N/A':
        query += " AND LOWER(Pitch) = LOWER(?)"
        params.append(pitch)

    query += " GROUP BY number, name, pitch, collection"

    cards = db_query(query, params)
    if cards is None:
        return jsonify({'message': 'Database query error'}), 500

    formatted_cards = [{"count": card[0], "collection": card[1], "name": card[2], "pitch": card[3], "type": card[4],
                        "language": card[5]} for card in cards]

    return jsonify(formatted_cards)


if __name__ == '__main__':
    create_table_if_not_exists()  # Make sure the table exists
    app.run(debug=True)

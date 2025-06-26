from flask import Flask, request, jsonify, send_from_directory
import os
import requests
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Make sure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Serve index.html
@app.route("/")
def index():
    return app.send_static_file("index.html")

# Endpoint to send user message to Rasa
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.form.get("message", "")

    if not user_input:
        return jsonify({"response": "Please enter a message."})

    try:
        # Send message to Rasa REST API
        rasa_response = requests.post(
            "http://localhost:5005/webhooks/rest/webhook",
            json={"sender": "user", "message": user_input}
        )
        data = rasa_response.json()
        if data and "text" in data[0]:
            return jsonify({"response": data[0]["text"]})
        else:
            return jsonify({"response": "Sorry, I didn't get that."})

    except Exception as e:
        print("Error contacting Rasa:", e)
        return jsonify({"response": "Server error. Please try again later."})

# Endpoint to handle file upload
@app.route("/upload", methods=["POST"])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No filename provided"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    return jsonify({"status": "success", "filename": filename})

# To serve uploaded files if needed
@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(debug=True, port=8000)

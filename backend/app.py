from flask import Flask, request, jsonify, send_from_directory
import os
import requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import openai

# Load OpenAI key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route("/")
def index():
    return app.send_static_file("index.html")

# 🧠 Updated Chat Route: Try Rasa, fallback to ChatGPT
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.form.get("message", "")
    if not user_input:
        return jsonify({"response": "Please enter a message."})

    try:
        # 🔄 Try Rasa first
        rasa_response = requests.post(
            "http://localhost:5005/webhooks/rest/webhook",
            json={"sender": "user", "message": user_input}
        )
        data = rasa_response.json()

        # ✅ If Rasa returns a valid response
        if data and "text" in data[0]:
            return jsonify({"response": data[0]["text"]})

        # ❌ If Rasa doesn't understand → Ask OpenAI
        else:
            openai_response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant specialized in cybercrime support."},
                    {"role": "user", "content": user_input}
                ]
            )
            bot_reply = openai_response.choices[0].message["content"]
            return jsonify({"response": bot_reply})

    except Exception as e:
        print("Error:", e)
        return jsonify({"response": "Server error. Please try again later."})

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

@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(debug=True, port=8000)

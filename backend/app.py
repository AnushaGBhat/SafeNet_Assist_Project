from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import openai
import mimetypes

# 🔐 Load keys
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    image_filename = request.json.get("image", None)

    try:
        # 🔁 First try Rasa
        rasa_res = requests.post(
            "http://localhost:5005/webhooks/rest/webhook",
            json={"sender": "user", "message": user_input}
        )
        rasa_data = rasa_res.json()
        if rasa_data and "text" in rasa_data[0]:
            return jsonify({"response": rasa_data[0]["text"]})

    except Exception as e:
        print("🔁 Rasa fallback:", e)

    try:
        # 🧠 Fallback: OpenAI (Vision if image)
        if image_filename:
            img_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            with open(img_path, "rb") as img_file:
                result = openai.ChatCompletion.create(
                    model="gpt-4-vision-preview",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that explains image content."},
                        {"role": "user", "content": [
                            {"type": "text", "text": user_input},
                            {"type": "image_url", "image_url": {"url": f"data:{mimetypes.guess_type(img_path)[0]};base64,{img_file.read().encode('base64')}" }}
                        ]}
                    ],
                    max_tokens=1000
                )
                reply = result.choices[0].message.content
        else:
            result = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant for cybercrime victims."},
                    {"role": "user", "content": user_input}
                ]
            )
            reply = result.choices[0].message["content"]
        return jsonify({"response": reply})

    except Exception as e:
        print("❌ OpenAI error:", e)
        return jsonify({"response": "⚠️ Could not connect to OpenAI."})

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No filename"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    return jsonify({"filename": filename, "status": "success"})

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(debug=True, port=8000)

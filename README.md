# AI Chatbot – Rasa + Flask + OpenAI

This project is an AI-powered chatbot built using Rasa, Flask, Python, OpenAI, and a simple HTML/CSS/JavaScript frontend. It understands user queries, generates intelligent responses, and provides an interactive browser-based chat interface.

---

## Technologies Used
- Python  
- Rasa  
- Flask  
- OpenAI API  
- HTML  
- CSS  
- JavaScript  

---

## Features
- Intent classification and entity detection using Rasa  
- Dialogue management through rules and stories  
- Flask backend to connect frontend and Rasa server  
- OpenAI integration for enhanced responses  
- Clean and simple chat UI  
- Easy setup and execution  

---

## Installation & Setup

### 1️⃣ Install Dependencies
pip install -r requirements.txt

### 2️⃣ Train the Rasa Model
rasa train

### 3️⃣ Start the Rasa Action Server
rasa run actions

### 4️⃣ Start the Rasa Server
rasa run --cors "*" --enable-api

### 5️⃣ Start the Flask Server
python app.py

### 6️⃣ Open the Chatbot UI
Open the `index.html` file in any browser.

## Working Screenshots

### 🟦 Chat Interface
<p align="center">
  <img src="screenshots/Screenshot%202025-12-05%20095523.png" 
       width="650" 
       style="border: 2px solid #4CAF50; border-radius: 12px;">
</p>

---

### 🎤 Mic Permission & File Upload Popup
<p align="center">
  <img src="screenshots/Screenshot%202025-12-05%20095716.png" 
       width="650" 
       style="border: 2px solid #4CAF50; border-radius: 12px;">
</p>

---

### 📁 Chat History Sidebar
<p align="center">
  <img src="screenshots/Screenshot%202025-12-05%20102617.png" 
       width="650" 
       style="border: 2px solid #4CAF50; border-radius: 12px;">
</p>





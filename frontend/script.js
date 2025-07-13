const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const fileInput = document.getElementById("file-upload");
const micBtn = document.getElementById("mic-btn");
const newChatBtn = document.getElementById("new-chat");
const chatHistory = document.getElementById("chat-history");

let currentChat = [];
let chatList = [];

function appendMessage(sender, message, isFile = false) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message", sender);

  if (isFile) {
    const ext = message.split('.').pop().toLowerCase();
    const fileUrl = `/uploads/${message}`;
    if (["jpeg", "jpg", "png", "gif", "png"].includes(ext)) {
      messageEl.innerHTML = `<strong>${sender}:</strong><br><img src="${fileUrl}" class="chat-img" alt="Image" />`;
    } else {
      messageEl.innerHTML = `<strong>${sender}:</strong><br><a href="${fileUrl}" target="_blank">${message}</a>`;
    }
  } else {
    messageEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
  }

  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getBotReply(message) {
  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data.response;
  } catch (err) {
    console.error("Bot error:", err);
    return "⚠️ Server error. Try again later.";
  }
}

async function handleFileUpload(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.filename) {
      appendMessage("you", data.filename, true);
      currentChat.push({ sender: "you", content: data.filename, isFile: true });
    }
  } catch (err) {
    console.error("File upload failed:", err);
    appendMessage("bot", "❌ File upload failed.");
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  const file = fileInput.files[0];

  if (file) {
    await handleFileUpload(file);
    fileInput.value = "";
  }

  if (message) {
    appendMessage("you", message);
    currentChat.push({ sender: "you", content: message });

    const botReply = await getBotReply(message);
    appendMessage("bot", botReply);
    currentChat.push({ sender: "bot", content: botReply });

    userInput.value = "";
  }
});

micBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    userInput.focus();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    alert("🎤 Mic not working or permission denied.");
  };
});

newChatBtn.addEventListener("click", () => {
  if (currentChat.length > 0) {
    chatList.push(currentChat);
    addToChatHistory(currentChat);
  }
  currentChat = [];
  chatBox.innerHTML = "";
});

function addToChatHistory(chat) {
  const item = document.createElement("div");
  item.classList.add("history-item");
  item.textContent = chat[0]?.content?.toString().slice(0, 20) || "Chat";

  const del = document.createElement("span");
  del.className = "delete-icon";
  del.innerHTML = "❌";
  del.title = "Delete chat";
  del.onclick = (e) => {
    e.stopPropagation();
    item.remove();
    const idx = [...chatHistory.children].indexOf(item);
    if (idx > -1) chatList.splice(idx, 1);
  };

  item.onclick = () => {
    chatBox.innerHTML = "";
    currentChat = chat;
    chat.forEach((msg) => {
      appendMessage(msg.sender, msg.content, msg.isFile || false);
    });
  };

  item.appendChild(del);
  chatHistory.appendChild(item);
}

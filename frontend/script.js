const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const fileInput = document.getElementById("file-upload");
const newChatBtn = document.getElementById("new-chat");
const chatHistory = document.getElementById("chat-history");

let currentChat = [];
let chatList = [];

function appendMessage(sender, message, isFile = false, fileBlob = null) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message", sender);

  if (isFile && fileBlob) {
    const url = URL.createObjectURL(fileBlob);
    if (/\.(jpeg|jpg|png|gif)$/i.test(message.name)) {
      messageEl.innerHTML = `<strong>${sender}:</strong><br><img src="${url}" class="chat-img" alt="Image" />`;
    } else {
      messageEl.innerHTML = `<strong>${sender}:</strong><br><a href="${url}" target="_blank">Download ${message.name}</a>`;
    }
  } else {
    messageEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
  }

  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🔁 Send message to Rasa
async function getBotReply(message) {
  try {
    const res = await fetch("http://localhost:5005/webhooks/rest/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "user", message }),
    });

    const data = await res.json();
    return data.map(d => d.text).join("\n");
  } catch (err) {
    console.error("Bot error:", err);
    return "Sorry, I couldn't reach the server.";
  }
}

// 📤 File Upload + Preview
function handleFileUpload(file) {
  if (!file) return;
  appendMessage("user", file, true, file);
  currentChat.push({ sender: "user", content: file.name, isFile: true });
}

// 💬 Submit Handler
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  const file = fileInput.files[0];

  if (!message && !file) return;

  if (message) {
    appendMessage("user", message);
    currentChat.push({ sender: "user", content: message });

    const botReply = await getBotReply(message);
    appendMessage("bot", botReply);
    currentChat.push({ sender: "bot", content: botReply });

    userInput.value = "";
  }

  if (file) {
    handleFileUpload(file);
    fileInput.value = "";
  }
});

// ➕ New Chat Button
newChatBtn.addEventListener("click", () => {
  if (currentChat.length > 0) {
    chatList.push(currentChat);
    addToChatHistory(currentChat);
  }
  currentChat = [];
  chatBox.innerHTML = "";
});

// 🕘 Chat History
function addToChatHistory(chat) {
  const item = document.createElement("div");
  item.classList.add("history-item");
  item.textContent = chat[0]?.content?.toString().slice(0, 20) || "Chat";

  const del = document.createElement("span");
  del.className = "delete-icon";
  del.innerHTML = "❌";
  del.title = "Delete chat";
  del.style.marginLeft = "10px";
  del.style.cursor = "pointer";
  del.style.color = "silver";

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

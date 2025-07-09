/* Get DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");


/* Replace with your deployed Cloudflare Worker URL */
const WORKER_URL = "https://holy-sound-7357.rneha2729.workers.dev";

/* Store the conversation history */
let messages = [
  {
    role: "system",
    content:
      "You are a shopping assistant for L’Oréal, a site that helps users find L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations. You provide expert recommendations based on the user's needs, preferences, and budget, keeping responses clear, helpful, and friendly.",
  },
];

/* Load conversation history from localStorage if available */
function loadHistory() {
  const saved = localStorage.getItem("loreal_chat_history");
  if (saved) {
    const parsed = JSON.parse(saved);
    // Show each message in the chat window (skip the system message)
    parsed.forEach((msg) => {
      if (msg.role === "user") addMessage("user", msg.content);
      if (msg.role === "assistant") addMessage("ai", msg.content);
    });
    // Restore messages array (keep system message at the start)
    messages = [
      messages[0], // system message
      ...parsed.filter(msg => msg.role !== "system")
    ];
  }
}

/* Save conversation history to localStorage (excluding system message) */
function saveHistory() {
  // Only save user and assistant messages
  const toSave = messages.filter(msg => msg.role !== "system");
  localStorage.setItem("loreal_chat_history", JSON.stringify(toSave));
}

/* Function to add a message to the chat window */
function addMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Save history after each message
  saveHistory();
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Add user's message to chat and history
  addMessage("user", message);
  messages.push({ role: "user", content: message });

  // Clear the input field
  userInput.value = "";

  // Show a loading message
  addMessage("ai", "Thinking...");

  try {
    // Send the full conversation history to the Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();

    // Remove the loading message
    chatWindow.lastChild.remove();

    // Get the assistant's reply and add it to chat and history
    let aiReply;
    if (data.choices?.[0]?.message?.content) {
      aiReply = data.choices[0].message.content;
    } else if (data.error?.message) {
      aiReply = `Error: ${data.error.message}`;
    } else {
      aiReply = "Sorry, I couldn't get a response.";
    }
    addMessage("ai", aiReply);
    messages.push({ role: "assistant", content: aiReply });
  } catch (err) {
    // Remove the loading message and show an error
    chatWindow.lastChild.remove();
    addMessage("ai", "Sorry, there was an error connecting to the assistant.");
  }
});

/* On page load, show welcome message and load history */
const welcomeMsg = document.createElement("div");
welcomeMsg.textContent =
  "👋 Hello! I’m your L’Oréal shopping assistant. Ask me about makeup, skincare, haircare, fragrances, or routines!";
welcomeMsg.className = "msg ai";
chatWindow.appendChild(welcomeMsg);

loadHistory();

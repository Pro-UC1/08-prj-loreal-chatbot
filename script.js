/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial welcome message
chatWindow.textContent =
  "👋 Hello! I’m your L’Oréal shopping assistant. Ask me about makeup, skincare, haircare, fragrances, or routines!";

/* Replace with your deployed Cloudflare Worker URL */
const WORKER_URL = "https://snowy-dawn-ebc7.rneha2729.workers.dev/"; // <-- Change this!ooo ok 

/* Function to add a message to the chat window */
function addMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Show user's message
  addMessage("user", message);
  userInput.value = "";

  // Show a loading message
  addMessage("ai", "Thinking...");

  // Prepare messages for the API, including a detailed system prompt
  const messages = [
    {
      role: "system",
      content:
        "You are a shopping assistant for L’Oréal, a site that helps users find L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations. You provide expert recommendations based on the user's needs, preferences, and budget, keeping responses clear, helpful, and friendly.",
    },
    { role: "user", content: message },
  ];

  try {
    // Send the user's message to the Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();

    // Remove the loading message
    chatWindow.lastChild.remove();

    // Show the assistant's reply
    const aiReply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't get a response.";
    addMessage("ai", aiReply);
  } catch (err) {
    // Remove the loading message and show an error
    chatWindow.lastChild.remove();
    addMessage("ai", "Sorry, there was an error connecting to the assistant.");
  }
});

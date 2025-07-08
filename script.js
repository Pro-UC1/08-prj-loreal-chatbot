/* Get DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* Add the L'Oréal logo image at the top of the chat window */
// You can use a public L'Oréal logo or save one in your project folder and use a relative path.
const lorealLogo = document.createElement("img");
lorealLogo.src =
  "https://upload.wikimedia.org/wikipedia/commons/6/6e/Logo_L%E2%80%99Or%C3%A9al.svg"; // Public L'Oréal logo
lorealLogo.alt = "L'Oréal Logo";
lorealLogo.style.width = "120px";
lorealLogo.style.display = "block";
lorealLogo.style.margin = "16px auto";
chatWindow.appendChild(lorealLogo);

/* Set initial welcome message */
const welcomeMsg = document.createElement("div");
welcomeMsg.textContent =
  "👋 Hello! I’m your L’Oréal shopping assistant. Ask me about makeup, skincare, haircare, fragrances, or routines!";
welcomeMsg.className = "msg ai";
chatWindow.appendChild(welcomeMsg);

/* Replace with your deployed Cloudflare Worker URL */
const WORKER_URL = "https://snowy-dawn-ebc7.rneha2729.workers.dev/";

/* Store the conversation history */
let messages = [
  {
    role: "system",
    content:
      "You are a shopping assistant for L’Oréal, a site that helps users find L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations. You provide expert recommendations based on the user's needs, preferences, and budget, keeping responses clear, helpful, and friendly.",
  },
];

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

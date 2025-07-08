// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey =
      "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"; // Make sure to name your secret OPENAI_API_KEY in the Cloudflare Workers dashboard
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const userInput = await request.json();

    const requestBody = {
      model: "gpt-4o",
      messages: userInput.messages,
      max_completion_tokens: 200,
      temperature: 0.7,
      frequency_penalty: 0.5,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  },
};

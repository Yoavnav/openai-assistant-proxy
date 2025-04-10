const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = "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"; // Replace with your OpenAI API key
const ASSISTANT_ID = "asst-4go7VUsic0ZdbdV6zXhAFk8w"; // Replace with your Assistant ID

// Serve static files (if needed)
app.use(express.static('public'));

// Define the /chat route to interact with OpenAI
app.post('/chat', async (req, res) => {
  const messageText = req.body.messageText;

  try {
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const thread = await threadRes.json();

    const messages = [{ role: "user", content: messageText }];
    
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user",
        content: messages
      })
    });

    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    const run = await runRes.json();
    let runStatus = run.status;
    let finalRun;

    while (runStatus !== "completed" && runStatus !== "failed" && runStatus !== "cancelled") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const runCheck = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
      });

      finalRun = await runCheck.json();
      runStatus = finalRun.status;
    }

    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    });

    const allMessages = await messagesRes.json();
    const lastMessage = allMessages.data.reverse().find(m => m.role === "assistant");

    res.json({ reply: lastMessage?.content[0]?.text?.value || "No response." });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

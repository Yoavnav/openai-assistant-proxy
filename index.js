const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = "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"; // Replace with your OpenAI API key
const ASSISTANT_ID = "asst-4go7VUsic0ZdbdV6zXhAFk8w"; // Replace with your Assistant ID

app.post('/chat', async (req, res) => {
  const messageText = req.body.messageText;

  try {
    // Create thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    const thread = await threadRes.json();

    // Send message to assistant
    const messages = [{
      role: "user",
      content: messageText
    }];
    
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user",
        content: messages

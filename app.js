const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const app = express();
const port = process.env.PORT || 3000;
const chatEmitter = new EventEmitter();

// CORS Middleware to allow access from your Codespaces domain
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to serve the chat HTML file
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
}

// Handle chat messages and log to terminal

function respondChat(req, res) {
  const { message } = req.query;

  if (message) {
    console.log(req.query);
    chatEmitter.emit('message', message);
    res.end('Message received');
  } else {
    res.status(400).send('No message provided');
  }
}

// Handle server-sent events (SSE) for real-time updates
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });


  const onMessage = (message) => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    console.log('Client disconnected from /sse');
    chatEmitter.off('message', onMessage);
  });
}

// Route definitions
app.get('/', chatApp);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// Start the server on 0.0.0.0 to allow access from Codespaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});

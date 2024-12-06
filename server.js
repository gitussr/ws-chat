const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

let clientIdCounter = 1;

app.use(express.static('public'));

wss.on('connection', (ws) => {
    const clientId = `Client${clientIdCounter++}`; // Assign a unique ID
    ws.id = clientId; // Store the ID in the WebSocket instance

    console.log(`${clientId} connected`);

    // Notify all clients about the new connection
    const welcomeMessage = `${clientId} joined the chat`;
    broadcastMessage(welcomeMessage);

    ws.on('message', (message) => {
        const messageWithId = `${ws.id}: ${message}`; // Prefix the message with the client's ID
        console.log(`Received from ${ws.id}: ${message}`);
        broadcastMessage(messageWithId);
    });

    ws.on('close', () => {
        console.log(`${clientId} disconnected`);
        broadcastMessage(`${clientId} left the chat`);
    });
});

// Function to broadcast messages to all clients
function broadcastMessage(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

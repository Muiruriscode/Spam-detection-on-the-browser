const http = require('http');
const express = require("express");
const app = express();
const server = http.createServer(app);

var io = require('socket.io')(server);

app.use(express.static("www"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/www/index.html");
});



io.on('connect', socket => {
  console.log('Client connected');

  socket.on('comment', (data) => {

    socket.broadcast.emit('remoteComment', data);
  });
});


const listener = server.listen(3000, () => {
    console.log("Your app is listening on port 3000..." );
  });
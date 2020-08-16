const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const nocache = require('nocache');

var counter = 0;
const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening at...");
});

const io = require('socket.io')(server);

app.use(express.static('public'));

app.use(nocache());
app.set('etag', false);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});



const startPosition1 = {x : 100, y : 400};
const startPosition2 = {x : 700, y : 400};

io.on('connection', (socket) => {
  console.log("Connection made...");
  socket.on('message-from-client-to-serve', (msg) => {
    console.log(msg);
  });

  socket.on('other-player-movement', (data) => {

    socket.broadcast.emit('other-player-movement', data);
  });

  socket.on('consume-food', (data) => {
    socket.broadcast.emit('consume-food');

    setTimeout(function(data){

      var x = Math.ceil(Math.random() * 1000);
      var y = Math.ceil(Math.random() * 600);
      io.emit('make-food', {x : x, y : y});
    }, 3000);
  });

  if (counter == 0)
  {
    socket.emit('start-position', startPosition1);
    //socket.emit('enable-player-2', startPosition2);
    counter = 1;
  }else{
    socket.emit('start-position', startPosition2);
    //socket.emit('enable-player-2', startPosition1);

    setTimeout(function(data) {
      io.emit('start-match');
      io.emit('make-food', {x : 100, y : 100});
    } , 3000);
    counter = 0;
  }
});

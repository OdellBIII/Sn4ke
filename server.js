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



const startPosition1 = {x : 100, y : 400, color : 0xFF0000, ticker : 10, isBoostEnabled : true, boost : 20};
const startPosition2 = {x : 700, y : 400, color : 0x0000FF, ticker : 10, isBoostEnabled : false, boost : 10};

var roomno = 1;
io.on('connection', (socket) => {

  if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms['room-'+roomno].length > 1)
  {
    roomno += 1;
  }

  console.log("Connection made...");
  socket.join("room-" + roomno);
  console.log("Most recent connection just joined room number " + roomno);

  startPosition1.roomno = roomno;
  startPosition2.roomno = roomno;
  // Handling user input from client and emitting to other players
  socket.on('other-player-movement', (data) => {

    socket.to("room-"+data.roomno).emit('other-player-movement', data);
  });

  // Handling when food is consumed by client. Emits information to other clients
  socket.on('consume-food', (data) => {

    socket.to("room-"+data.roomno).emit('consume-food');

    setTimeout(function(irrev){

      var x = Math.ceil(Math.random() * 1000);
      var y = Math.ceil(Math.random() * 600);
      io.in("room-"+data.roomno).emit('make-food', {x : x, y : y});
      console.log("Food created at location: " + x + ", " + y);
    }, 3000);
  });

  // Handling when the connected client collides with another client
  socket.on('snake-collision', function(data){

    startPosition1.name = "player-2";
    socket.to("room-"+data.roomno).emit('snake-collsion', startPosition1);

    startPosition1.name = "player-1";
    socket.emit('snake-collision', startPosition1);
  });

  // Determines whether to emit first or second starting position based on when
  // the player joined
  if (counter == 0)
  {
    socket.emit('start-position', startPosition1);
    //socket.emit('enable-player-2', startPosition2);
    counter = 1;
  }
  else
  {
    socket.emit('start-position', startPosition2);
    socket.emit('enable-player-2', startPosition1);
    socket.to("room-"+roomno).emit('enable-player-2', startPosition2);

    io.in("room-"+roomno).emit('make-food', {x : 500, y : 300});
    io.in("room-"+roomno).emit('start-match');
    counter = 0;
  }
});

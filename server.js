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


const colors = [0xFF0000, 0x0000FF, 0x00FF00];

const startPosition1 = {x : 100, y : 400, color : colors[0], ticker : 15, speedBoost : 10, name : "player-1", playerNumber : "player-1"};
const startPosition2 = {x : 700, y : 400, color : colors[1], ticker : 15, speedBoost : 10, name : "player-2", playerNumber : "player-2"};
const startPosition3 = {x : 400, y : 200, color : colors[2], ticker : 15, speedBoost : 10, name : "player-3", playerNumber : "player-3"};

const other_snakes = {player1 : startPosition1, player2 : startPosition2, player3 : startPosition3};


// Generate food with random x,y coordinates and random color
function generateRandomFood(width, height, roomno, colors){

  var color = colors[Math.floor(Math.random() * colors.length)];
  var x = Math.floor(Math.random() * width);
  var y = Math.floor(Math.random() * height);
  io.in("room-"+ roomno).emit('make-food', {x : x, y : y, color : color});
  console.log("Food created at location: " + x + ", " + y);
}

var roomno = 1;
io.on('connection', (socket) => {

  if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms['room-'+roomno].length > 2)
  {
    roomno += 1;
  }

  console.log("Connection made...");
  socket.join("room-" + roomno);
  console.log("Most recent connection just joined room number " + roomno);

  startPosition1.roomno = roomno;
  startPosition2.roomno = roomno;
  startPosition3.roomno = roomno;

  // Handling user input from client and emitting to other players
  socket.on('other-player-movement', (data) => {

    socket.to("room-"+data.roomno).emit('other-player-movement', data);
  });

  // Handling when food is consumed by client. Emits information to other clients
  socket.on('consume-food', (data) => {

    socket.to("room-"+data.roomno).emit('consume-food');

    setTimeout(function(){
      generateRandomFood(1000, 600, data.roomno, colors);
    }, 3000);
  });

  // Handling when the connected client collides with another client
  socket.on('snake-collision', function(data){

    socket.to("room-"+data.roomno).emit('snake-collsion', startPosition1);

    socket.emit('snake-collision', startPosition1);
  });

  // Determines whether to emit first or second starting position based on when
  // the player joined
  if (counter == 0)
  {
    socket.emit('start-position', startPosition1);
    //socket.emit('enable-player-2', startPosition2);
    counter += 1;
  }
  else if(counter == 1)
  {
    socket.emit('start-position', startPosition2);
    counter += 1;
  }
  else if(counter == 2)
  {
    socket.emit('start-position', startPosition3);

    io.in("room-"+roomno).emit('make-food', {x : 500, y : 300});
    io.in("room-"+roomno).emit("enable-other-players", other_snakes);
    io.in("room-"+roomno).emit('start-match');
    counter = 0;
  }

});

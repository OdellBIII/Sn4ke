const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const nocache = require('nocache');

var match_rooms = {
  1 : {
    counter : 0,
    number_of_players : 0,
  },
  3 : {
    counter : 0,
    number_of_players : 0,
  },
  5 : {
    counter : 0,
    number_of_players : 0,
  },
};

var counter = 0;
const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening at...");
});

const io = require('socket.io')(server);

app.use(express.static('public'));

app.use(nocache());
app.set('etag', false);

app.get("/", (req, res) => {

  var user = req.query;
  var cookie = {user_id : user.user_id, wager : user.wager};

  res.cookie("user_data", cookie);
  res.sendFile(path.join(__dirname + "/index.html"));
});


const colors = [0xFF0000, 0x0000FF, 0x00FF00, 0xA87343];

const snake_1 = {x : 200, y : 400, color : colors[0], ticker : 10, speedBoost : 10, user_id : "", wager : 0, name : "player-1", playerNumber : "player-1"};
/*
snake_1.bodyY = [];
snake_1.bodyY[0] = snake_1.y + 40;
snake_1.bodyY[1] = snake_1.y + 80;
snake_1.bodyX[0] = snake_1.x;
snake_1.bodyX[1] = snake_1.x;
*/
const snake_2 = {x : 400, y : 400, color : colors[1], ticker : 10, speedBoost : 10, user_id : "", wager : 0, name : "player-2", playerNumber : "player-2"};
const snake_3 = {x : 600, y : 400, color : colors[2], ticker : 10, speedBoost : 10, user_id : "", wager : 0, name : "player-3", playerNumber : "player-3"};
const snake_4 = {x : 800, y : 400, color : colors[3], ticker : 10, speedBoost : 10, user_id : "", wager : 0, name : "player-4", playerNumber : "player-4"};

const other_snakes = {player1 : snake_1, player2 : snake_2, player3 : snake_3, player4 : snake_4};


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

  let wager = parseInt(socket.handshake.query.wager);
  console.log("New connections wager is " + wager);
  console.log(match_rooms);

  if(match_rooms.hasOwnProperty(wager))
  {
    if(match_rooms[wager].number_of_players > 3)
    {
      match_rooms[wager].counter += 1;
      match_rooms[wager].number_of_players = 1;
    }
    else
    {
      match_rooms[wager].number_of_players += 1;
    }
  }
  else
  {
    console.log("Wager room did not exist. Creating new one..");
    match_rooms[wager] = {number_of_players : 1, counter : 0};
  }

  /*
  if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms['room-'+roomno].length > 3)
  {
    roomno += 1;
    counter = 0;
  }
  */

  console.log("Connection made...");
  socket.join("room-" + wager + "-" + match_rooms[wager].counter);
  console.log("User just joined room-" + wager + "-" + match_rooms[wager].counter);

  snake_1.roomno = wager + "-" + match_rooms[wager].counter;
  snake_2.roomno = wager + "-" + match_rooms[wager].counter;
  snake_3.roomno = wager + "-" + match_rooms[wager].counter;
  snake_4.roomno = wager + "-" + match_rooms[wager].counter;

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

    socket.to("room-"+data.roomno).emit('snake-collsion', snake_1);

    socket.emit('snake-collision', snake_1);
  });

  socket.on("disconnect", function(data){

  });

  // Determines whether to emit first or second starting position based on when
  // the player joined
  if (match_rooms[wager].number_of_players == 1)
  {
    socket.emit('start-position', snake_1);
    console.log("First player given position in room-" + snake_1.roomno);
    counter += 1;
  }
  else if(match_rooms[wager].number_of_players == 2)
  {
    socket.emit('start-position', snake_2);
    console.log("Second player given position in room-" + snake_2.roomno);
    counter += 1;
  }
  else if(match_rooms[wager].number_of_players == 3)
  {
    socket.emit('start-position', snake_3);
    console.log("Third player given position in room-" + snake_3.roomno);
    counter += 1;
  }
  else if(match_rooms[wager].number_of_players == 4)
  {

    socket.emit('start-position', snake_4);
    console.log("Fourth player given position in room-" + snake_1.roomno);

    io.in("room-"+snake_4.roomno).emit('make-food', {x : 500, y : 300});
    io.in("room-"+snake_4.roomno).emit("enable-other-players", other_snakes);
    io.in("room-"+snake_4.roomno).emit('start-match');
    console.log("Started match in room-" + wager + "-" + match_rooms[wager].counter);
    counter = 0;
  }

});

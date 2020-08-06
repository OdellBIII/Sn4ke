const fs = require('fs').promises;
const express = require('express');


const app = express();
const host = 'localhost';
const port = process.env.PORT;

if (port == null || port == ""){
  port = 8000;
}

app.listen(port);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log("Server listening at ${port}");
})

const express = require('express');


const app = express();
const host = 'localhost';

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
  res.status(200).end();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening at ${port}");
})

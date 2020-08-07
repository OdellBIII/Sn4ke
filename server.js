const express = require('express');


const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html");
  res.sendFile("main.js");
  res.status(200).end();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening at ${port}");
})

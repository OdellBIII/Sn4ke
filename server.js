const express = require('express');
const path = require('path');

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
  res.status(200).end();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening at ${port}");
})

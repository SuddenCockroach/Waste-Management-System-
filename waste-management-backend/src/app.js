const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

// ROOT GET - test if server responds
app.get("/", (req, res) => {
  res.send("API is alive - GET works!");
});

// SIMPLE POST TEST - this must work
app.post("/test", (req, res) => {
  console.log("Received POST /test"); // This will show in terminal
  res.json({ message: "POST test successful!", received: req.body });
});

app.listen(PORT, () => {
  console.log(`Minimal server running on http://localhost:${PORT}`);
  console.log(`Test GET: curl http://localhost:${PORT}/`);
  console.log(`Test POST: curl -X POST http://localhost:${PORT}/test -d '{}' -H "Content-Type: application/json"`);
});
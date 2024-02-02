const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDatabase } = require("./config/mongodb");
// const { getIPAddress } = require("./utils/getIPAddress");

dotenv.config();
connectDatabase();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app
  .use(cors())
  .set("x-powered-by", false)
  .use(express.urlencoded({ extended: true }))
  .use(express.json());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running...",
  });
});

app.use("/api/auth", require("./src/routes/auth.js"));
app.use("/api/friend-request", require("./src/routes/friends.js"));

const text = `
************************************************************
                  Listening on port: ${PORT}
                  http://localhost:${PORT}
************************************************************`;

app.listen(PORT, () => {
  console.log(text);
});

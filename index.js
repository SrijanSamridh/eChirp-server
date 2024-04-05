const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDatabase } = require("./config/mongodb");
// const { getIPAddress } = require("./utils/getIPAddress");

dotenv.config();
connectDatabase();
const app = express();
const PORT = Number(process.env.PORT) || 8080;

app
  .use(cors({
    origin: [
      "http://localhost:3000",
      "https://e-chirp-server.vercel.app",
      "https://e-chirp-web-app.vercel.app",
      "http://127.0.0.1:5500",
      "https://app.eventchirp.com",
      "https://api.eventchirp.com/",
    ],
    credentials: true,
  }))
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
app.use("/api/friend", require("./src/routes/friends.js"));
app.use("/api/events", require("./src/routes/events.js"));
app.use("/api/groups", require("./src/routes/groups.js"));
app.use("/api/participants", require("./src/routes/participants.js"));
app.use("/api/message", require("./src/routes/messae.js"));

const text = `
************************************************************
                  Listening on port: ${PORT}
                  http://localhost:${PORT}
************************************************************`;

app.listen(PORT, () => {
  console.log(text);
});

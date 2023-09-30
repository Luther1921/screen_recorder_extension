const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const VideoRoute = require("./routes/videoRoute");
const app = express();

dotenv.config();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//route
app.use("/api", VideoRoute);

const Port = process.env.PORT || 3000;

connectDB();

app.listen(Port, () => {
  console.log(`Server is running on Port ${Port}`);
});

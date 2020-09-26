//import
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Messages = require("./dbMessages");
const message = require("./routes/messageRoutes");
require("dotenv").config();
const Pusher = require("pusher");

//app config
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: process.env.appId,
  key: process.env.key,
  secret: process.env.secret,
  cluster: "eu",
  useTLS: true,
});

//middleware
app.use(express.json());
app.use(cors());
app.use("/messages", message);

//DB CONFIG
//db connection mongodb+srv://peterwale:<password>@restapi.psmw0.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority

mongoose.connect(process.env.URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});
mongoose.connection.on("open", () => {
  console.log("connection to db successful");
});

// PUSHER CONFIG
const db = mongoose.connection; //connect to db
db.once("open", () => {
  //connect to the collection you want to watch
  const collection = db.collection("messagecontents"); //Make sure the collection name matches the one on the db
  const changeStream = collection.watch();

  //monitor changes to the collection
  changeStream.on("change", (data) => {
    //check for the operation type on the change
    if (data.operationType === "insert") {
      const messageDetails = data.fullDocument;
      //push the changes to the pusher trigger
      pusher.trigger("messages", "inserted", {
        id: messageDetails._id,
        name: messageDetails.name,
        message: messageDetails.message,
        time: messageDetails.time,
        received: messageDetails.received,
      });
    } else {
      console.log("error triggering pusher");
    }
  });
});

//api routes
app.get("/", (req, res) => {
  return res.status(200).send("Hello World!!!");
});

//post message
app.post("/messages/new", (req, res) => {
  const message = req.body;
  Messages.create(message, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

//

//listen
app.listen(port, () => console.log(`Listening on localhost: ${port}`));

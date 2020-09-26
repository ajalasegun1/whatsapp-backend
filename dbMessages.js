const mongoose = require("mongoose");

const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  time: String,
  received: Boolean,
});

module.exports = mongoose.model("messageContent", whatsappSchema);

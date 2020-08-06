const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  username: String,
  title: String,
  content: String,
});

module.exports = mongoose.model("Post", PostSchema);

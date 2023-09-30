const mongoose = require("mongoose");

const Video = mongoose.model("Video", {
  videoUrl: String,
  transcription: String,
});

module.exports = Video;

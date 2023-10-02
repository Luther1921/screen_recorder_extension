const mongoose = require("mongoose");

const Video = mongoose.model("Video", {
  videoUrl: String,
  transcription: String,
  uploadTime: Date,
});

module.exports = Video;

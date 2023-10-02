const ffmpeg = require("fluent-ffmpeg");

function extractAudioFromVideo(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .noVideo() // Remove video stream
      .audioCodec("pcm_s16le") // Set audio codec to pcm_s16le (raw audio)
      .on("end", () => {
        console.log("Audio extraction finished.");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error extracting audio:", err);
        reject(err);
      })
      .save(outputFilePath);
  });
}

module.exports = extractAudioFromVideo;

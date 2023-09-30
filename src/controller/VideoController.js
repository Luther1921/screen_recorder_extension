const Video = require("../model/video");
const fs = require("fs");
const transcribeAudio = require("../helper/transcribe");

let videoChunks = [];
let transcriptionChunks = [];

//Endpoint that Handles incoming video chunks and transcribe audio asynchronously

const videoStream = async (req, res) => {
  const { videoChunk, audioChunk } = req.body;

  // Store video chunks
  videoChunks.push(Buffer.from(videoChunk, "base64"));

  // Asynchronously transcribe audio chunks
  const transcription = await transcribeAudio(audioChunk);
  transcriptionChunks.push(transcription);

  res.status(200).send("Video chunk received and processing.");
};

// Endpoint to compile and send video and transcription as response

const compile = async (req, res) => {
  // Compile video from chunks
  const compiledVideo = Buffer.concat(videoChunks);

  // Compile transcription text from chunks
  const compiledTranscription = transcriptionChunks.join(" ");

  // Save compiled video to local disk
  const videoFileName = "compiled-video.webm";
  fs.writeFileSync(videoFileName, compiledVideo);

  // Save video and transcription data to the database
  const video = new Video({
    videoUrl: videoFileName,
    transcription: compiledTranscription,
  });
  await video.save();

  res.json({
    videoUrl: video.videoUrl,
    transcription: video.transcription,
  });
};

// Endpoint to play the saved and transcribed video
const playVideo = async (req, res) => {
  const videoId = req.query.videoId; // Get video ID from query parameter

  // Retrieve video data from the database based on videoId
  const video = await Video.findById(videoId);

  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  // Respond with video URL and transcription
  res.json({
    videoUrl: video.videoUrl,
    transcription: video.transcription,
  });
};

module.exports = { videoStream, compile, playVideo };

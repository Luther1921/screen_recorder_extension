const Video = require("../model/video");
const fs = require("fs");
const transcribeAudio = require("../helper/transcribe");
const extractAudioFromVideo = require("../helper/extract");

let videoChunks = [];
let transcriptionChunks = [];

//Endpoint that Handles incoming video chunks and transcribe audio asynchronously

const videoStream = async (req, res) => {
  try {
    const { videoChunk } = req.body;

    // Temporary paths for video and extracted audio
    const videoFilePath = "temp-video.mp4";
    const audioFilePath = "temp-audio.wav";

    // Save video chunk to temporary file
    fs.writeFileSync(videoFilePath, Buffer.from(videoChunk, "base64"));

    // Extract audio from video
    await extractAudioFromVideo(videoFilePath, audioFilePath);

    const transcription = await transcribeAudio(audioFilePath);
    transcriptionChunks.push(transcription);

    console.log(transcriptionChunks);
    // Remove temporary files
    fs.unlinkSync(videoFilePath);
    fs.unlinkSync(audioFilePath);

    // Store video chunks
    videoChunks.push(Buffer.from(videoChunk, "base64"));

    console.log(transcriptionChunks);
    console.log(videoChunks);
    res.status(200).send("Video chunk received and processing.");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Endpoint to compile and send video and transcription as response

const compile = async (req, res) => {
  try {
    // Compile video from chunks
    const compiledVideo = Buffer.concat(videoChunks);

    // Compile transcription text from chunks
    const compiledTranscription = transcriptionChunks.join(" ");
    console.log(videoChunks);
    // Save compiled video to local disk
    const videoFileName = "compiled-video.webm";
    fs.writeFileSync(videoFileName, compiledVideo);

    // Save video and transcription data to the database
    const video = await Video.create({
      videoUrl: videoFileName,
      transcription: compiledTranscription,
      uploadTime: Date(),
    });

    // Delete the local compiled video file after saving to the database
    fs.unlinkSync(videoFileName);

    res.json({
      videoId: Video.id,
      videoUrl: video.videoUrl,
      transcription: video.transcription,
      uploadTime: Date(),
    });
  } catch (error) {
    console.error("Error during compilation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Endpoint to play the saved and transcribed video
const playVideo = async (req, res) => {
  try {
    const { id } = req.params;
    // Retrieve video data from the database based on videoId
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json({
      videoUrl: video.videoUrl,
      transcription: video.transcription,
      uploadTime: Date(),
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const test = async (req, res) => {
  try {
    const update = await Video.updateMany({}, { $set: { uploadTime: "" } });
    console.log(update);
    if (!update) {
      return res.status(400).json({ error: "Error occured !" });
    }

    return res.status(200).json({ message: "successful!" });
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

module.exports = { videoStream, compile, playVideo, test };

const Video = require("../model/video");
const fs = require("fs");
const transcribeAudio = require("../service/transcribe");
const extractAudioFromVideo = require("../service/extract");
const generateSessionId = require("../helper/generateSessionId");

let sessionChunks = {}; // Object to store video and transcription chunks based on session ID

const videoStream = async (req, res) => {
  try {
    const { videoChunk, sessionId } = req.body;

    // Check if the session ID is provided, generate one if not
    const currentSessionId = sessionId || generateSessionId();

    // Initialize session chunks if it's a new session
    if (!sessionChunks[currentSessionId]) {
      sessionChunks[currentSessionId] = {
        videoChunks: [],
        transcriptionChunks: [],
      };
    }

    // Temporary paths for video and extracted audio
    const videoFilePath = `temp-video-${currentSessionId}.mp4`;
    const audioFilePath = `temp-audio-${currentSessionId}.wav`;

    // Save video chunk to temporary file
    fs.writeFileSync(videoFilePath, Buffer.from(videoChunk, "base64"));

    // Extract audio from video
    await extractAudioFromVideo(videoFilePath, audioFilePath);

    const transcription = await transcribeAudio(audioFilePath);
    sessionChunks[currentSessionId].transcriptionChunks.push(transcription);

    // Remove temporary files
    fs.unlinkSync(videoFilePath);
    fs.unlinkSync(audioFilePath);

    // Store video chunks
    sessionChunks[currentSessionId].videoChunks.push(
      Buffer.from(videoChunk, "base64")
    );

    res.status(200).json({
      sessionId: currentSessionId,
      message: "Video chunk received and processing.",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Endpoint to compile and send video and transcription as response

const compile = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Check if the provided session ID exists in sessionChunks
    if (!sessionChunks[sessionId]) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const compiledVideo = Buffer.concat(sessionChunks[sessionId].videoChunks);
    const compiledTranscription =
      sessionChunks[sessionId].transcriptionChunks.join(" ");

    // Save compiled video to local disk
    const videoFileName = "compiled-video.webm";
    fs.writeFileSync(videoFileName, compiledVideo);

    const video = await Video.create({
      videoUrl: videoFileName,
      transcription: compiledTranscription,
      uploadTime: Date(),
    });

    // Delete the local compiled video file after saving to the database
    fs.unlinkSync(videoFileName);
    // Clear the chunks for this session after compilation
    delete sessionChunks[sessionId];

    res.json({
      videoId: video.id,
      videoUrl: video.videoUrl,
      transcription: video.transcription,
      uploadTime: video.uploadTime,
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
      uploadTime: video.uploadTime,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = { videoStream, compile, playVideo };

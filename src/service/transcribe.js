const fs = require("fs");
const { Deepgram } = require("@deepgram/sdk");
const dotenv = require("dotenv");
dotenv.config();

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

const mimetype = "audio/wav";

// Initialize the Deepgram SDK

// Check whether requested file is local or remote, and prepare accordingly
async function transcribeAudio(file) {
  const deepgram = new Deepgram(deepgramApiKey);
  let source;

  if (file.startsWith("http")) {
    source = {
      url: file,
    };
  } else {
    const audio = fs.readFileSync(file);
    source = {
      buffer: audio,
      mimetype: mimetype,
    };
  }

  try {
    const response = await deepgram.transcription.preRecorded(source, {
      smart_format: true,
      model: "nova",
    });

    return response.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.log("Error transcribing audio:", error);
    throw error; //
  }
}

module.exports = transcribeAudio;

const axios = require("axios");

const OPENAI_API_KEY = process.env.API_KEY;
const WHISPER_API_URL = process.env.API_URL;

async function transcribeAudio(audioData) {
  try {
    const response = await axios.post(
      WHISPER_API_URL,
      {
        audio: audioData,
        config: {
          language: "en",
          punctuate: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    // Extract transcription from the response
    const transcription = response.data.choices[0].text.trim();

    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

module.exports = transcribeAudio;

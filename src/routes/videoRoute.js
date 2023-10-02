const express = require("express");
const router = express.Router();
const {
  videoStream,
  compile,
  playVideo,
} = require("../controller/VideoController");

router.post("/video-stream", videoStream);
router.get("/compile", compile);
router.get("/play-video/:id", playVideo);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  videoStream,
  compile,
  playVideo,
  test,
} = require("../controller/VideoController");

router.post("/video-stream", videoStream);
router.get("/compile", compile);
router.get("/play-video/:id", playVideo);

router.post("/test", test);

module.exports = router;

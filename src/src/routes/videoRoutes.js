const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.post('/generate', videoController.triggerGeneration);
router.get('/status/:jobId', videoController.getJobStatus);
router.get('/download/:jobId', videoController.downloadVideo);

module.exports = router;

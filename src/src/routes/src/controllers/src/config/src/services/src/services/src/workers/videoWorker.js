const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const aiService = require('../services/aiService');
const ffmpegService = require('../services/ffmpegService');

const updateJobState = async (jobId, payload) => {
  const data = await redisConnection.get(`job:${jobId}`);
  if (data) {
    const current = JSON.parse(data);
    await redisConnection.set(`job:${jobId}`, JSON.stringify({ ...current, ...payload }));
  }
};

const worker = new Worker('videoGeneration', async (job) => {
  const { jobId, story, genre, duration } = job.data;
  try {
    await updateJobState(jobId, { status: 'processing', progress: 10, stage: 'Expanding storyline arcs...' });
    const fullScript = await aiService.expandStoryToManhwaScript(story, genre, parseInt(duration));

    await updateJobState(jobId, { status: 'processing', progress: 40, stage: 'Generating high-fidelity layers...' });
    
    const relativeVideoPath = await ffmpegService.renderHighDefinitionVideo(fullScript, jobId, (renderProgress) => {
      const generalProgress = 40 + Math.floor((renderProgress / 100) * 58);
      updateJobState(jobId, { progress: generalProgress, stage: `Stitching media assets (${renderProgress}%)` });
    });

    await updateJobState(jobId, { status: 'completed', progress: 100, stage: 'Complete!', videoUrl: relativeVideoPath });
  } catch (error) {
    await updateJobState(jobId, { status: 'failed', progress: 0, stage: error.message });
  }
}, { connection: redisConnection });

console.log('Background Worker Engine Activated.');

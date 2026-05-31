const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const videoQueue = new Queue('videoGeneration', { connection: redisConnection });

exports.triggerGeneration = async (req, res, next) => {
  try {
    const { story, genre, duration } = req.body;
    const jobId = uuidv4();
    
    const initialStatus = {
      jobId,
      status: 'queued',
      progress: 0,
      stage: 'Script expansion initialized',
      createdAt: new Date()
    };
    
    await redisConnection.set(`job:${jobId}`, JSON.stringify(initialStatus));
    await videoQueue.add('generateVideo', { jobId, story, genre, duration }, { jobId });

    return res.status(202).json({ success: true, jobId });
  } catch (error) { next(error); }
};

exports.getJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const data = await redisConnection.get(`job:${jobId}`);
    if (!data) return res.status(404).json({ error: 'Job not found' });
    return res.json(JSON.parse(data));
  } catch (error) { next(error); }
};

exports.downloadVideo = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const data = await redisConnection.get(`job:${jobId}`);
    if (!data) return res.status(404).json({ error: 'Job not found' });

    const job = JSON.parse(data);
    const absolutePath = path.resolve(__dirname, '../../', job.videoUrl || '');
    return res.download(absolutePath);
  } catch (error) { next(error); }
};

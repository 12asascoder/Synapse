const express = require('express');
const router = express.Router();
const { Progress } = require('../models');

router.get('/:userId', async (req, res) => {
  try {
    let progress = await Progress.findOne({ where: { userId: req.params.userId } });
    if (!progress) {
      progress = await Progress.create({ userId: req.params.userId });
    }
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:userId/complete-day', async (req, res) => {
  try {
    let progress = await Progress.findOne({ where: { userId: req.params.userId } });
    if (!progress) {
      progress = await Progress.create({ userId: req.params.userId });
    }

    progress.currentDay += 1;
    progress.streak += 1;
    
    const currentHistory = progress.history || [];
    currentHistory.push({ day: progress.currentDay, score: progress.growthScore || 0 });
    progress.history = currentHistory;

    await progress.save();
    res.json({ message: 'Day completed', progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:userId/assessment', async (req, res) => {
  try {
    const { scores } = req.body;
    let progress = await Progress.findOne({ where: { userId: req.params.userId } });
    if (!progress) {
      progress = await Progress.create({ userId: req.params.userId });
    }

    const fields = ['knowledge', 'velocity', 'technical', 'communication', 'problemSolving', 'consistency', 'retention'];
    fields.forEach((field) => {
      if (scores && scores[field] !== undefined) {
        progress[`${field}Score`] = scores[field];
      }
    });

    const allScores = fields.map((f) => progress[`${f}Score`] || 0).filter((s) => s > 0);
    progress.growthScore = allScores.length
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    const currentHistory = progress.history || [];
    currentHistory.push({ day: progress.currentDay, score: progress.growthScore });
    progress.history = currentHistory;

    await progress.save();
    res.json({ message: 'Assessment saved', progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

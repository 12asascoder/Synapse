const express = require('express');
const router = express.Router();
const { AssessmentQuestion, Assessment } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/questions', authenticate, async (req, res) => {
  try {
    const { topic, limit = 5 } = req.query;
    const where = topic ? { topic } : {};
    const questions = await AssessmentQuestion.findAll({
      where,
      limit: parseInt(limit),
      order: [['difficulty', 'ASC']],
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit', authenticate, async (req, res) => {
  try {
    const { bootcampId, day, scores, answers } = req.body;
    const userId = req.user.id;
    const assessment = await Assessment.create({ userId, bootcampId, day, scores, answers, completed: true });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const assessments = await Assessment.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

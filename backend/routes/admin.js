const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  Bootcamp, CurriculumDay, AssessmentQuestion, Assessment,
  User, Progress, CommunityDiscussion, Achievement, UserAchievement, InterviewPrep,
} = require('../models');
const { Op } = require('sequelize');

// All routes require SUPER_ADMIN
router.use(authenticate, requireAdmin);

// ─── Bootcamps ───────────────────────────────────────────────────────────────

router.get('/bootcamps', async (req, res) => {
  try {
    const bootcamps = await Bootcamp.findAll({ order: [['createdAt', 'DESC']] });
    res.json(bootcamps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bootcamps' });
  }
});

router.post('/bootcamps', async (req, res) => {
  try {
    const { name, slug, description, icon, duration, level, color, outcomes, cert } = req.body;
    if (!name || !slug || !icon || !duration) {
      return res.status(400).json({ error: 'name, slug, icon, and duration are required' });
    }
    const bootcamp = await Bootcamp.create({
      name, slug, description: description || '', icon, duration,
      level: level || 'Beginner', color: color || '#6366f1',
      outcomes: outcomes || [], cert: cert !== false,
    });
    res.status(201).json(bootcamp);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A bootcamp with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create bootcamp' });
  }
});

router.put('/bootcamps/:id', async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findByPk(req.params.id);
    if (!bootcamp) return res.status(404).json({ error: 'Bootcamp not found' });
    const allowed = ['name', 'slug', 'description', 'icon', 'duration', 'level', 'color', 'outcomes', 'cert', 'isActive'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await bootcamp.update(updates);
    res.json(bootcamp);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A bootcamp with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update bootcamp' });
  }
});

router.delete('/bootcamps/:id', async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findByPk(req.params.id);
    if (!bootcamp) return res.status(404).json({ error: 'Bootcamp not found' });
    await CurriculumDay.destroy({ where: { bootcampId: bootcamp.id } });
    await bootcamp.destroy();
    res.json({ message: 'Bootcamp deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bootcamp' });
  }
});

// ─── Curriculum ──────────────────────────────────────────────────────────────

router.get('/curriculum', async (req, res) => {
  try {
    const where = req.query.bootcampId ? { bootcampId: req.query.bootcampId } : {};
    const days = await CurriculumDay.findAll({
      where,
      order: [['day', 'ASC']],
      include: [{ model: Bootcamp, attributes: ['name', 'slug', 'color'] }],
    });
    res.json(days);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch curriculum' });
  }
});

router.post('/curriculum', async (req, res) => {
  try {
    const { bootcampId, day, topic, sublabel, description, contentType } = req.body;
    if (!bootcampId || !day || !topic) {
      return res.status(400).json({ error: 'bootcampId, day, and topic are required' });
    }
    const existing = await CurriculumDay.findOne({ where: { bootcampId, day } });
    if (existing) return res.status(409).json({ error: `Day ${day} already exists for this bootcamp` });
    const currDay = await CurriculumDay.create({
      bootcampId, day: parseInt(day), topic,
      sublabel: sublabel || '', description: description || '',
      contentType: contentType || 'lesson',
    });
    res.status(201).json(currDay);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create curriculum day' });
  }
});

router.put('/curriculum/:id', async (req, res) => {
  try {
    const day = await CurriculumDay.findByPk(req.params.id);
    if (!day) return res.status(404).json({ error: 'Curriculum day not found' });
    const allowed = ['day', 'topic', 'sublabel', 'description', 'contentType', 'bootcampId'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await day.update(updates);
    res.json(day);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update curriculum day' });
  }
});

router.delete('/curriculum/:id', async (req, res) => {
  try {
    const day = await CurriculumDay.findByPk(req.params.id);
    if (!day) return res.status(404).json({ error: 'Curriculum day not found' });
    await day.destroy();
    res.json({ message: 'Curriculum day deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete curriculum day' });
  }
});

// ─── Assessment Questions ────────────────────────────────────────────────────

router.get('/assessments/questions', async (req, res) => {
  try {
    const questions = await AssessmentQuestion.findAll({ order: [['createdAt', 'DESC']] });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/assessments/questions', async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, topic, difficulty } = req.body;
    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({ error: 'question, options, and correctAnswer are required' });
    }
    const q = await AssessmentQuestion.create({
      question, options, correctAnswer: parseInt(correctAnswer),
      explanation: explanation || '', topic: topic || 'general',
      difficulty: difficulty || 'medium',
    });
    res.status(201).json(q);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

router.put('/assessments/questions/:id', async (req, res) => {
  try {
    const q = await AssessmentQuestion.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    const allowed = ['question', 'options', 'correctAnswer', 'explanation', 'topic', 'difficulty'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await q.update(updates);
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/assessments/questions/:id', async (req, res) => {
  try {
    const q = await AssessmentQuestion.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    await q.destroy();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

router.get('/assessments/submissions', async (req, res) => {
  try {
    const submissions = await Assessment.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    // Fetch user names for each submission
    const userIds = [...new Set(submissions.map(s => s.userId))];
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'name', 'email'],
    });
    const userMap = {};
    users.forEach(u => { userMap[u.id] = { name: u.name, email: u.email }; });
    const enriched = submissions.map(s => ({
      ...s.toJSON(),
      userName: userMap[s.userId]?.name || 'Unknown',
      userEmail: userMap[s.userId]?.email || '',
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ─── Certificates (Graduates) ───────────────────────────────────────────────

router.get('/certificates', async (req, res) => {
  try {
    const graduates = await Progress.findAll({
      where: { currentDay: { [Op.gte]: 30 } },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'tier', 'points'] }],
    });
    res.json(graduates.map(g => ({
      userId: g.userId,
      userName: g.User?.name || 'Unknown',
      userEmail: g.User?.email || '',
      tier: g.User?.tier || 'Trainee',
      points: g.User?.points || 0,
      growthScore: g.growthScore,
      completedAt: g.updatedAt,
      currentDay: g.currentDay,
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// ─── Community Moderation ────────────────────────────────────────────────────

router.get('/community/discussions', async (req, res) => {
  try {
    const discussions = await CommunityDiscussion.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'tier'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

router.delete('/community/discussions/:id', async (req, res) => {
  try {
    const discussion = await CommunityDiscussion.findByPk(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    await discussion.destroy();
    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete discussion' });
  }
});

// ─── Extended Analytics ──────────────────────────────────────────────────────

router.get('/analytics/detailed', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: { updatedAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });
    const totalAssessments = await Assessment.count({ where: { completed: true } });
    const totalBootcamps = await Bootcamp.count();
    const totalQuestions = await AssessmentQuestion.count();
    const totalDiscussions = await CommunityDiscussion.count();

    const allProgress = await Progress.findAll({ attributes: ['growthScore', 'currentDay'] });
    const avgGrowthScore = allProgress.length
      ? Math.round(allProgress.reduce((s, p) => s + p.growthScore, 0) / allProgress.length)
      : 0;
    const graduates = allProgress.filter(p => p.currentDay >= 30).length;

    // Per-bootcamp enrollment (count curriculum days as proxy)
    const bootcamps = await Bootcamp.findAll({
      attributes: ['id', 'name', 'slug', 'color'],
      include: [{ model: CurriculumDay, attributes: ['id'] }],
    });
    const bootcampStats = bootcamps.map(b => ({
      id: b.id, name: b.name, slug: b.slug, color: b.color,
      curriculumDays: b.CurriculumDays?.length || 0,
    }));

    // Score distribution
    const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    allProgress.forEach(p => {
      const s = p.growthScore;
      if (s <= 20) scoreRanges['0-20']++;
      else if (s <= 40) scoreRanges['21-40']++;
      else if (s <= 60) scoreRanges['41-60']++;
      else if (s <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    res.json({
      totalUsers, activeUsers, totalAssessments, totalBootcamps,
      totalQuestions, totalDiscussions, avgGrowthScore, graduates,
      bootcampStats, scoreDistribution: scoreRanges,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/interview-stats', async (req, res) => {
  try {
    const allPreps = await InterviewPrep.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    const totalPreps = allPreps.length;
    const activePreps = allPreps.filter(p => p.status === 'active').length;
    const completedPreps = allPreps.filter(p => p.status === 'completed').length;
    const allAnswers = allPreps.flatMap(p => p.answers || []);
    const scores = allAnswers.filter(a => a.score != null).map(a => a.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    res.json({
      totalPreps,
      activePreps,
      completedPreps,
      totalAnswers: allAnswers.length,
      avgScore,
      recentPreps: allPreps.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

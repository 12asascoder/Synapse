const express = require('express');
const router = express.Router();
const { CurriculumDay, Bootcamp, Progress, CurriculumPlan, UserProfile } = require('../models');
const { authenticate } = require('../middleware/auth');
const { trugenGenerate } = require('../ai/trugen');

function localGeneratePlan(profile) {
  const skills = profile?.skills || [];
  const targetRole = profile?.targetRole || 'Software Engineer';
  const skillNames = skills.map(s => s.name).filter(Boolean);

  const modules = [
    {
      id: 'mod-1', title: `${targetRole} Fundamentals`, days: 5,
      competencies: skillNames.slice(0, 3),
      exercises: 4, assessments: 2,
      masteryThreshold: 80, remedialTrigger: 80,
    },
    {
      id: 'mod-2', title: 'Core Proficiency', days: 7,
      competencies: skillNames.slice(0, 5),
      exercises: 6, assessments: 2,
      masteryThreshold: 85, remedialTrigger: 80,
    },
    {
      id: 'mod-3', title: 'Advanced Concepts', days: 8,
      competencies: skillNames.slice(0, 7),
      exercises: 6, assessments: 3,
      masteryThreshold: 90, remedialTrigger: 80,
    },
    {
      id: 'mod-4', title: 'Mastery & Integration', days: 10,
      competencies: skillNames,
      exercises: 8, assessments: 3,
      masteryThreshold: 92, remedialTrigger: 85,
    },
  ];

  return {
    success: true,
    plan: {
      targetRole,
      skillGap: skillNames.map(s => ({ name: s, current: 3, target: 5, confidence: 'medium' })),
      targetMastery: 92,
      masteryBreakdown: { quizWeight: 0.4, exerciseWeight: 0.3, efficiencyWeight: 0.15, consistencyWeight: 0.15 },
      modules,
      totalDays: modules.reduce((a, m) => a + m.days, 0),
    },
  };
}

router.post('/generate', authenticate, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ where: { userId: req.user.id } });
    if (!profile || !profile.skills || profile.skills.length < 3) {
      return res.status(400).json({ error: 'Add at least 3 skills before generating a curriculum' });
    }

    await CurriculumPlan.update({ status: 'archived' }, { where: { userId: req.user.id, status: 'active' } });

    let planData;
    try {
      const prompt = `Design a personalized curriculum to bring the user to 92% mastery for target role: ${profile.targetRole || 'Software Engineer'}.

User skills: ${JSON.stringify(profile.skills)}

The 92% mastery metric is defined as:
- Quiz accuracy ≥92%
- Exercise quality ≥92%
- Efficiency ≥92%
- Consistency (std dev of daily scores < 8 points)

Return JSON with: targetRole, skillGap array, targetMastery: 92, masteryBreakdown object, modules array (each with id, title, days, competencies, exercises, assessments, masteryThreshold, remedialTrigger), totalDays.`;

      const result = await trugenGenerate(`You are a learning science AI. Design a personalized curriculum optimized to bring the user to 92% mastery on all target competencies for their goal role. Output JSON only.

${prompt}`);
      planData = JSON.parse(result);
    } catch {
      planData = localGeneratePlan(profile);
    }

    const plan = planData.plan || planData;
    const curriculumPlan = await CurriculumPlan.create({
      userId: req.user.id,
      targetRole: profile.targetRole || plan.targetRole,
      skillGap: plan.skillGap || [],
      targetMastery: plan.targetMastery || 92,
      masteryBreakdown: plan.masteryBreakdown || { quizWeight: 0.4, exerciseWeight: 0.3, efficiencyWeight: 0.15, consistencyWeight: 0.15 },
      modules: plan.modules || [],
      totalDays: plan.totalDays || 30,
      progress: { completed: 0, scores: [], timeSpent: 0, currentModule: 0 },
      status: 'active',
    });

    res.json(curriculumPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plan/:userId', authenticate, async (req, res) => {
  try {
    const plan = await CurriculumPlan.findOne({
      where: { userId: req.params.userId, status: 'active' },
    });
    res.json(plan || { noActivePlan: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/advance', authenticate, async (req, res) => {
  try {
    const { planId, score, moduleId } = req.body;
    const plan = await CurriculumPlan.findOne({ where: { id: planId, userId: req.user.id } });
    if (!plan) return res.status(404).json({ error: 'Curriculum plan not found' });

    const progress = { ...plan.progress };
    progress.completed = (progress.completed || 0) + 1;
    progress.scores = [...(progress.scores || []), { moduleId: moduleId || `mod-${progress.completed}`, score: score || 0, date: new Date().toISOString() }];
    if (moduleId) {
      const modIndex = (plan.modules || []).findIndex(m => m.id === moduleId);
      if (modIndex >= 0) progress.currentModule = modIndex + 1;
    }

    await plan.update({ progress });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { bootcampId } = req.query;
    const progress = await Progress.findOne({ where: { userId: req.params.userId } });
    if (!progress) return res.status(404).json({ error: 'Progress not found' });

    const where = bootcampId ? { bootcampId } : {};
    const days = await CurriculumDay.findAll({
      where,
      order: [['day', 'ASC']],
      include: [{ model: Bootcamp, attributes: ['name', 'slug', 'color'] }],
    });

    const currentDay = progress.currentDay;
    const curriculumWithStatus = days.map((item) => {
      const d = item.toJSON();
      let status = 'locked';
      if (d.day < currentDay) status = 'complete';
      else if (d.day === currentDay) status = 'active';
      return { ...d, status };
    });

    res.json(curriculumWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const days = await CurriculumDay.findAll({
      order: [['day', 'ASC']],
      include: [{ model: Bootcamp, attributes: ['name', 'slug', 'color'] }],
    });
    res.json(days);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

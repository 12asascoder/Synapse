const express = require('express');
const router = express.Router();
const { Progress, CurriculumPlan, UserProfile } = require('../models');
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


router.post('/remedial', authenticate, async (req, res) => {
  try {
    const { planId, moduleId, score } = req.body;
    const plan = await CurriculumPlan.findOne({ where: { id: planId, userId: req.user.id } });
    if (!plan) return res.status(404).json({ error: 'Curriculum plan not found' });

    const mod = (plan.modules || []).find(m => m.id === moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });

    const needsRemedial = score < (mod.remedialTrigger || 80);
    if (!needsRemedial) {
      return res.json({ needsRemedial: false, message: 'Score meets threshold. No remedial needed.' });
    }

    const remedialContent = {
      moduleId: mod.id,
      moduleTitle: mod.title,
      triggeredAt: new Date().toISOString(),
      score,
      threshold: mod.remedialTrigger || 80,
      gap: (mod.remedialTrigger || 80) - score,
      recommendedActions: [
        `Review ${mod.title} fundamentals — focus on weak areas identified in your assessment`,
        `Complete ${Math.min(3, mod.exercises || 1)} additional practice exercises`,
        `Re-attempt the module assessment after practice`,
      ],
      resources: (mod.competencies || []).map(c => ({
        topic: c,
        type: 'review',
        description: `Review core concepts in ${c}`,
        estimatedTime: '30-45 minutes',
      })),
      reinforcementPlan: {
        extraDays: Math.ceil(mod.days / 3),
        exercises: Math.min(3, mod.exercises || 1),
        reassessmentRequired: true,
      },
    };

    const modules = [...(plan.modules || [])];
    const idx = modules.findIndex(m => m.id === moduleId);
    if (idx >= 0) {
      modules[idx] = { ...modules[idx], remedial: remedialContent };
      await plan.update({ modules });
    }

    res.json({ needsRemedial: true, remedial: remedialContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/adjust-difficulty', authenticate, async (req, res) => {
  try {
    const { planId, recentScores } = req.body;
    const plan = await CurriculumPlan.findOne({ where: { id: planId, userId: req.user.id } });
    if (!plan) return res.status(404).json({ error: 'Curriculum plan not found' });

    const scores = recentScores || [];
    const avgRecent = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const adjustments = [];
    const modules = [...(plan.modules || [])];

    modules.forEach((mod, i) => {
      const adjustment = { moduleId: mod.id, title: mod.title };
      if (avgRecent >= 92) {
        adjustment.difficulty = 'advanced';
        adjustment.change = 'accelerated';
        adjustment.days = Math.max(2, Math.floor((mod.days || 5) * 0.75));
        adjustment.note = 'Performing well — accelerated pace with advanced material';
      } else if (avgRecent >= 80) {
        adjustment.difficulty = 'standard';
        adjustment.change = 'maintained';
        adjustment.days = mod.days;
        adjustment.note = 'On track — maintain current pace';
      } else if (avgRecent >= 60) {
        adjustment.difficulty = 'supported';
        adjustment.change = 'extended';
        adjustment.days = Math.floor((mod.days || 5) * 1.25);
        adjustment.note = 'Needs reinforcement — extended time with additional practice';
      } else {
        adjustment.difficulty = 'foundational';
        adjustment.change = 'slowed';
        adjustment.days = Math.floor((mod.days || 5) * 1.5);
        adjustment.note = 'Foundational gaps detected — slower pace with core concepts';
      }
      adjustments.push(adjustment);
      modules[i] = { ...modules[i], ...adjustment };
    });

    await plan.update({ modules });

    res.json({ adjustments, totalDays: modules.reduce((a, m) => a + (m.days || 5), 0) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

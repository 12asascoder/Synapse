const express = require('express');
const router = express.Router();
const { User, Achievement, UserAchievement, Progress, Bootcamp } = require('../models');

router.get('/verify/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [achievements, userAchievements, progress] = await Promise.all([
      Achievement.findAll(),
      UserAchievement.findAll({ where: { userId: user.id } }),
      Progress.findOne({ where: { userId: user.id } }),
    ]);

    const earnedIds = userAchievements.map((ua) => ua.achievementId);
    const earned = achievements.filter((a) => earnedIds.includes(a.id));

    let bootcamp = null;
    if (progress?.bootcampId) {
      bootcamp = await Bootcamp.findByPk(progress.bootcampId);
    }

    res.json({
      user: { name: user.name, tier: user.tier, points: user.points },
      earnedAchievements: earned.map((a) => ({ id: a.id, name: a.name, icon: a.icon, description: a.description })),
      progress: progress ? {
        currentDay: progress.currentDay,
        technical: progress.technical,
        problemSolving: progress.problemSolving,
        communication: progress.communication,
        consistency: progress.consistency,
        retention: progress.retention,
        velocity: progress.velocity,
      } : null,
      bootcamp: bootcamp ? { name: bootcamp.name, icon: bootcamp.icon } : null,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

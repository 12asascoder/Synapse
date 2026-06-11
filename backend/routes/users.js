const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me/preferences', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const prefs = req.body.preferences || {};
    const clean = {
      streaming: prefs.streaming !== undefined ? !!prefs.streaming : true,
      animations: prefs.animations !== undefined ? !!prefs.animations : true,
      sound: prefs.sound !== undefined ? !!prefs.sound : false,
    };
    user.preferences = clean;
    await user.save();
    res.json({ preferences: clean });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

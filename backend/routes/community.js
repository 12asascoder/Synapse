const express = require('express');
const router = express.Router();
const { CommunityDiscussion, User } = require('../models');
const { Op } = require('sequelize');

router.get('/discussions', async (req, res) => {
  try {
    const discussions = await CommunityDiscussion.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'avatar', 'tier'] }],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'avatar', 'tier', 'points'],
      order: [['points', 'DESC']],
      limit: 20,
    });
    res.json(users.map((u, i) => ({ rank: i + 1, ...u.toJSON() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/discussions', async (req, res) => {
  try {
    const { userId, title, content, category } = req.body;
    const discussion = await CommunityDiscussion.create({ userId, title, content, category });
    const full = await CommunityDiscussion.findByPk(discussion.id, {
      include: [{ model: User, attributes: ['id', 'name', 'avatar', 'tier'] }],
    });
    const io = req.app.get('io');
    if (io) io.emit('new-discussion', full);
    res.json(full);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

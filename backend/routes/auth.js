const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Progress } = require('../models');
const { generateToken } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ where: { email } });
    
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user = await User.create({ name, email, password: hashedPassword, role: role || 'USER' });
    await Progress.create({ userId: user.id });

    const token = generateToken(user);
    res.json({
      message: 'User created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tier: user.tier, onboardingComplete: user.onboardingComplete },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tier: user.tier, onboardingComplete: user.onboardingComplete },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

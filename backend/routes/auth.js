const express = require('express');
const router = express.Router();
const { User, Progress } = require('../models');

// Basic mock register/login without real JWT for rapid prototyping
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ where: { email } });
    
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = await User.create({ name, email, password, role: role || 'USER' });
    await Progress.create({ userId: user.id });

    res.json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { User, UserProfile } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    let profile = await UserProfile.findOne({ where: { userId: req.params.userId } });
    if (!profile) {
      profile = await UserProfile.create({ userId: req.params.userId });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const allowed = ['resumeUrl', 'resumeParsed', 'skills', 'githubUrl', 'portfolioUrl', 'linkedinUrl', 'goal', 'targetRole', 'targetCompany', 'interviewDeadline'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    let profile = await UserProfile.findOne({ where: { userId: req.params.userId } });
    if (!profile) {
      profile = await UserProfile.create({ userId: req.params.userId, ...update });
    } else {
      await profile.update(update);
    }

    if (req.body.onboardingComplete) {
      await User.update({ onboardingComplete: true }, { where: { id: req.params.userId } });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resume/parse', authenticate, async (req, res) => {
  try {
    const { resumeText, resumeUrl } = req.body;
    if (!resumeText && !resumeUrl) {
      return res.status(400).json({ error: 'Provide resumeText or resumeUrl' });
    }

    const text = resumeText || `[Resume at ${resumeUrl} — text extraction not available server-side]`;

    // Use TruGen AI to parse the resume
    const trugen = require('../ai/trugen');
    const prompt = `You are a resume parser. Extract structured information from this resume text.

Resume text:
${text.slice(0, 8000)}

Return valid JSON with this exact schema (no markdown, no explanation):
{
  "success": true|false,
  "data": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "portfolio": "string or null",
    "summary": "string or null",
    "experiences": [{"title": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string", "skillsUsed": ["string"]}],
    "education": [{"degree": "string", "institution": "string", "year": "string", "field": "string"}],
    "skills": [{"name": "string", "category": "string", "years": "number"}],
    "certifications": [{"name": "string", "issuer": "string", "year": "string"}]
  },
  "warnings": ["string"],
  "confidence": "high"|"medium"|"low"
}

If the text is unparseable, set success: false and include a clear error message.`;

    const result = await trugen.generate(prompt);
    let parsed;
    try {
      parsed = JSON.parse(result.response);
    } catch {
      return res.status(422).json({ error: 'Failed to parse resume', detail: 'AI returned unparseable response' });
    }

    if (!parsed.success) {
      return res.status(422).json({ error: 'Failed to parse resume', detail: parsed.userMessage || 'Could not extract information from resume' });
    }

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

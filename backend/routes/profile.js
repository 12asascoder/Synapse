const express = require('express');
const router = express.Router();
const { User, UserProfile } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id != req.params.userId && req.user.role !== 'SUPER_ADMIN') {
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
    if (req.user.id != req.params.userId) {
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

    // Local fallback parser — extracts skills from plain text without AI
    function localParseResume(t) {
      const skillsList = [];
      const techKeywords = ['Python', 'JavaScript', 'TypeScript', 'React', 'Node', 'AWS', 'Docker',
        'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST', 'API',
        'Git', 'Linux', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
        'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
        'Agile', 'Scrum', 'CI/CD', 'Terraform', 'Ansible', 'Jenkins', 'kubernetes', 'gcp'];
      techKeywords.forEach(skill => {
        if (t.toLowerCase().includes(skill.toLowerCase())) {
          skillsList.push({ name: skill, category: 'technical', years: 1 });
        }
      });

      const emailMatch = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const linkedinMatch = t.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
      const githubMatch = t.match(/github\.com\/[a-zA-Z0-9_-]+/i);

      return {
        success: true,
        data: {
          name: null, 
          email: emailMatch ? emailMatch[0] : null, 
          phone: null, 
          linkedin: linkedinMatch ? `https://www.${linkedinMatch[0]}` : null, 
          github: githubMatch ? `https://${githubMatch[0]}` : null,
          portfolio: null, 
          summary: t.length > 100 ? t.slice(0, 500) + '...' : t,
          experiences: [],
          education: [],
          skills: skillsList.slice(0, 20),
          certifications: []
        },
        warnings: ['AI not available — basic keyword extraction used'],
        confidence: 'low'
      };
    }

    let result;
    try {
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

      result = await trugen.trugenGenerate(prompt);
    } catch (err) {
      return res.json(localParseResume(text));
    }

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      return res.json(localParseResume(text));
    }

    if (!parsed.success) {
      return res.json(localParseResume(text));
    }

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

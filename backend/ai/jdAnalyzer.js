const { trugenGenerate } = require('./trugen');

const SYSTEM_PROMPT = `You are a senior technical recruiter and career coach. Analyze the job description against the user's resume profile to produce a structured gap analysis and prep roadmap.

Tone: direct, calibrated to the user's seniority level (junior/mid/senior/staff). Do not inflate or deflate the user's standing — be realistic.

Output JSON only. Seniority calibration rules:
- Junior (0-2yr): focus on fundamentals, learning ability, potential
- Mid (3-5yr): focus on independence, delivery track record, tech depth
- Senior (6-10yr): focus on architecture decisions, mentoring, trade-offs
- Staff+ (10+yr): focus on org impact, strategy, cross-team leadership`;

function localAnalyze(jdText, resumeProfile) {
  const skills = resumeProfile?.skills || [];
  const skillNames = skills.map(s => s.name?.toLowerCase() || '');
  const kw = ['Python','JavaScript','TypeScript','React','Node','AWS','Docker','Kubernetes','SQL','MongoDB','PostgreSQL','Redis','GraphQL','REST','API','Git','Linux','Java','Go','Rust','Ruby','PHP','Swift','Kotlin','TensorFlow','PyTorch','Machine Learning','Deep Learning','NLP','Computer Vision','Agile','Scrum','CI/CD','Terraform','Ansible','Jenkins','GCP','Azure','System Design','Microservices','Leadership','Communication'];
  const keywords = kw.filter(k => t.toLowerCase().includes(k.toLowerCase())) || [];

  const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase()))];
  const matched = uniqueKeywords.filter(k => skillNames.includes(k));
  const missing = uniqueKeywords.filter(k => !skillNames.includes(k));

  return {
    success: true,
    data: {
      matchedSkills: matched.map(k => ({ name: k, userProficiency: 3, jdWeight: 'required', matchQuality: 'medium' })),
      missingSkills: missing.map(k => ({ name: k, priority: 'critical', learningEstimate: '2 weeks' })),
      partialSkills: [],
      seniorityMatch: { jdSeniority: 'mid', userSeniority: 'mid', match: 'partial' },
      gapScore: Math.round((missing.length / Math.max(uniqueKeywords.length, 1)) * 100),
      recommendedFocus: missing.slice(0, 5),
      prepIntensity: missing.length > 5 ? 'structured' : 'crash',
    },
  };
}

async function analyzeJD(jdText, resumeProfile) {
  try {
    const profileJson = JSON.stringify(resumeProfile || {});
    const prompt = `Job Description:
${jdText}

User Resume Profile:
${profileJson}

Analyze and return JSON:
1. matchedSkills: skills in both JD and resume with proficiency
2. missingSkills: skills in JD but NOT in resume, with priority (critical/nice-to-have)
3. partialSkills: skills in the JD where user has some but not sufficient depth
4. seniorityMatch: {jdSeniority, userSeniority, match}
5. gapScore: 0-100 (0 = all matched, 100 = nothing matches)
6. recommendedFocus: 3-5 areas the user should prioritize
7. prepIntensity: 'crash' | 'structured' | 'full' based on gap + timeline`;
    const result = await trugenGenerate(SYSTEM_PROMPT + '\n\n' + prompt);
    try {
      return JSON.parse(result);
    } catch {
      return localAnalyze(jdText, resumeProfile);
    }
  } catch {
    return localAnalyze(jdText, resumeProfile);
  }
}

module.exports = { analyzeJD };

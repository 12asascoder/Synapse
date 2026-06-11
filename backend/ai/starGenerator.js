const { trugenGenerate } = require('./trugen');

const SYSTEM_PROMPT = `You are a senior interview coach generating tailored STAR (Situation, Task, Action, Result) and OVE (Opinion, Vision, Experience) questions.

Each question must be:
1. Realistic — based on actual patterns from the user's target company level
2. Specific — tied to the JD requirements AND the user's resume experiences
3. Actionable — the user should be able to prepare a structured response

Seniority calibration (adjust question depth):
- Junior: "Tell me about a time you learned a new technology quickly"
- Mid: "Tell me about a time you made a technical trade-off decision"
- Senior: "Tell me about a time you architected a system that had to scale 10x"
- Staff+: "Tell me about a time you influenced an organization-wide technical strategy"

Question distribution across 24:
- 8 behavioral (past experiences, teamwork, conflict)
- 8 technical/domain (algorithms, system design, domain-specific)
- 8 leadership/collaboration (mentoring, cross-team, ownership)

Additionally generate 5 OVE questions (explained below).

OVE Definition:
- Opinion — "What's your opinion on microservices vs monoliths for a team of 10?"
- Vision — "Where do you see ML infrastructure going in the next 3 years?"
- Experience — "Walk me through your most impactful project end-to-end"

Output JSON only. Validate that each question has all required fields.`;

function localGenerateQuestions(jdAnalysis, resumeProfile, mode) {
  const jdData = jdAnalysis?.data || {};
  const missingSkills = jdData.missingSkills || [];
  const focusAreas = jdData.recommendedFocus || [];
  const targetRole = resumeProfile?.targetRole || 'Software Engineer';

  const behavioral = [
    { id: 'STAR-001', category: 'behavioral', difficulty: 'medium', question: `Tell me about a time you had to deliver a project under a tight deadline.`, targetedSkill: 'time management', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-002', category: 'behavioral', difficulty: 'medium', question: 'Describe a conflict you resolved within your team.', targetedSkill: 'conflict resolution', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-003', category: 'behavioral', difficulty: 'hard', question: 'Tell me about a time you failed and what you learned.', targetedSkill: 'resilience', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-004', category: 'behavioral', difficulty: 'easy', question: 'Describe a time you went above and beyond your responsibilities.', targetedSkill: 'ownership', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-005', category: 'behavioral', difficulty: 'medium', question: 'Tell me about a time you had to persuade someone to adopt your approach.', targetedSkill: 'influence', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-006', category: 'behavioral', difficulty: 'medium', question: 'Describe a situation where you had to work with a difficult stakeholder.', targetedSkill: 'stakeholder management', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-007', category: 'behavioral', difficulty: 'easy', question: 'Tell me about a time you helped a teammate grow.', targetedSkill: 'mentoring', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-008', category: 'behavioral', difficulty: 'hard', question: 'Describe a time you had to make a decision with incomplete information.', targetedSkill: 'decision making', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
  ];

  const missing = missingSkills.length > 0 ? missingSkills[0].name : focusAreas[0] || 'the relevant technology';
  const technical = [
    { id: 'STAR-009', category: 'technical', difficulty: 'medium', question: `Walk me through how you would design a system that handles ${missing}.`, targetedSkill: missing, suggestedFramework: 'Requirements → Architecture → Trade-offs → Scaling', evaluationCriteria: ['Clear requirements gathering', 'Architecture diagram description', 'Trade-off discussion'], seniorityLevel: 'mid' },
    { id: 'STAR-010', category: 'technical', difficulty: 'hard', question: 'Describe a time you optimized a slow-performing system.', targetedSkill: 'performance optimization', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-011', category: 'technical', difficulty: 'medium', question: 'Tell me about a technical decision you made that had significant trade-offs.', targetedSkill: 'technical decision making', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-012', category: 'technical', difficulty: 'easy', question: 'Describe a project where you used data to drive a technical decision.', targetedSkill: 'data-driven development', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-013', category: 'technical', difficulty: 'hard', question: 'Tell me about a time you debugged a complex production issue.', targetedSkill: 'debugging', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-014', category: 'technical', difficulty: 'medium', question: 'Describe how you would architect a migration from a monolith to microservices.', targetedSkill: 'system design', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-015', category: 'technical', difficulty: 'medium', question: 'Tell me about a time you implemented automated testing that improved code quality.', targetedSkill: 'testing/quality', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-016', category: 'technical', difficulty: 'hard', question: 'Describe a time you had to choose between different technology stacks for a project.', targetedSkill: 'technology evaluation', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
  ];

  const leadership = [
    { id: 'STAR-017', category: 'leadership', difficulty: 'medium', question: 'Tell me about a time you mentored a junior engineer to improve their skills.', targetedSkill: 'mentoring', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-018', category: 'leadership', difficulty: 'hard', question: 'Describe a time you led a cross-team initiative.', targetedSkill: 'cross-team collaboration', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-019', category: 'leadership', difficulty: 'medium', question: 'Tell me about a time you improved team processes.', targetedSkill: 'process improvement', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-020', category: 'leadership', difficulty: 'easy', question: 'Describe a time you took ownership of a project outside your scope.', targetedSkill: 'ownership', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-021', category: 'leadership', difficulty: 'hard', question: 'Tell me about a time you had to deliver difficult feedback.', targetedSkill: 'feedback', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-022', category: 'leadership', difficulty: 'medium', question: 'Describe a time you built consensus around a technical vision.', targetedSkill: 'technical leadership', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-023', category: 'leadership', difficulty: 'medium', question: 'Tell me about a time you managed competing priorities from multiple stakeholders.', targetedSkill: 'prioritization', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
    { id: 'STAR-024', category: 'leadership', difficulty: 'hard', question: 'Describe a time you influenced an organizational change.', targetedSkill: 'organizational influence', suggestedFramework: 'Situation → Task → Action → Result', evaluationCriteria: ['Clear situation context', 'Specific action taken', 'Quantified result'], seniorityLevel: 'mid' },
  ];

  const oveQuestions = [
    { id: 'OVE-001', type: 'opinion', question: `What's your opinion on using ${missing} in production for a ${targetRole} role?`, targetedSkill: 'technical opinion', depth: 'conversational' },
    { id: 'OVE-002', type: 'vision', question: 'Where do you see the industry heading in the next 3 years for this domain?', targetedSkill: 'industry awareness', depth: 'strategic' },
    { id: 'OVE-003', type: 'experience', question: 'Walk me through your most impactful project end-to-end, from conception to delivery.', targetedSkill: 'project execution', depth: 'detailed' },
    { id: 'OVE-004', type: 'opinion', question: 'What do you think distinguishes a great engineer from a good one?', targetedSkill: 'self-awareness', depth: 'reflective' },
    { id: 'OVE-005', type: 'vision', question: 'If you were to build a team from scratch for this role, what qualities would you prioritize?', targetedSkill: 'team building', depth: 'strategic' },
  ];

  const allQuestions = [...behavioral, ...technical, ...leadership];
  return {
    success: true,
    starQuestions: allQuestions,
    oveQuestions: oveQuestions,
    totalQuestions: 29,
    estimatedPrepTime: mode === 'crash' ? 'crash: 4 hours / structured: 12 hours' : 'structured: 12 hours',
  };
}

async function generateQuestions(jdAnalysis, resumeProfile, mode) {
  try {
    const prompt = `Generate STAR and OVE interview questions for:
Role: ${resumeProfile?.targetRole || 'Software Engineer'}
Company: ${resumeProfile?.targetCompany || 'target company'}
Mode: ${mode || 'structured'}

JD Analysis: ${JSON.stringify(jdAnalysis?.data || {})}
Resume Skills: ${JSON.stringify(resumeProfile?.skills || [])}

Return 24 STAR questions (8 behavioral, 8 technical, 8 leadership) and 5 OVE questions as JSON matching the schema.`;
    const result = await trugenGenerate(SYSTEM_PROMPT + '\n\n' + prompt);
    try {
      return JSON.parse(result);
    } catch {
      return localGenerateQuestions(jdAnalysis, resumeProfile, mode);
    }
  } catch {
    return localGenerateQuestions(jdAnalysis, resumeProfile, mode);
  }
}

module.exports = { generateQuestions };

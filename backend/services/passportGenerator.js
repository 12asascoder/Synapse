const { trugenGenerate } = require('../ai/trugen');

function generateLocalPassport(prep) {
  const answers = prep.answers || [];
  const scores = answers.filter(a => a.score != null).map(a => a.score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const sorted = [...answers].filter(a => a.score != null).sort((a, b) => (b.score || 0) - (a.score || 0));
  const top3 = sorted.slice(0, 3);

  const competencies = [
    { skill: 'Technical Skills', score: avgScore, change: '+0' },
    { skill: 'Behavioral Fit', score: Math.min(100, avgScore + 5), change: '+0' },
    { skill: 'Communication', score: Math.min(100, avgScore - 3), change: '+0' },
  ];

  return {
    success: true,
    passport: {
      generatedAt: new Date().toISOString(),
      candidateName: 'Candidate',
      targetRole: 'Target Role',
      targetCompany: 'Target Company',
      prepDuration: `${prep.starQuestions?.length || 24} questions`,
      prepMode: prep.mode || 'structured',
      competencyProfile: competencies,
      starHighlights: top3.map(a => ({
        questionId: a.questionId || 'STAR-000',
        question: a.question || '',
        score: a.score || 0,
        excerpt: (a.answer || '').slice(0, 200),
      })),
      gapClosure: [],
      readinessScore: avgScore,
      overallAssessment: `Completed ${answers.length} questions with an average score of ${avgScore}/100. ${avgScore >= 80 ? 'Strong performance across all areas.' : avgScore >= 60 ? 'Good foundation with room for improvement in specific areas.' : 'Further practice recommended to build confidence.'}`,
    },
  };
}

async function generatePassport(prep) {
  try {
    const answers = prep.answers || [];
    const scores = answers.filter(a => a.score != null).map(a => a.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const sorted = [...answers].filter(a => a.score != null).sort((a, b) => (b.score || 0) - (a.score || 0));
    const top3 = sorted.slice(0, 3);

    const competencies = [
      { skill: 'Technical Skills', score: avgScore, change: '+0' },
      { skill: 'Behavioral Fit', score: Math.min(100, avgScore + 5), change: '+0' },
      { skill: 'Communication', score: Math.min(100, avgScore - 3), change: '+0' },
    ];

    return {
      success: true,
      passport: {
        generatedAt: new Date().toISOString(),
        candidateName: 'Candidate',
        targetRole: 'Target Role',
        targetCompany: 'Target Company',
        prepDuration: `${prep.starQuestions?.length || 24} questions`,
        prepMode: prep.mode || 'structured',
        competencyProfile: competencies,
        starHighlights: top3.map(a => ({
          questionId: a.questionId || 'STAR-000',
          question: a.question || '',
          score: a.score || 0,
          excerpt: (a.answer || '').slice(0, 200),
        })),
        gapClosure: [],
        readinessScore: avgScore,
        overallAssessment: `Completed ${answers.length} questions with an average score of ${avgScore}/100.`,
      },
    };
  } catch {
    return generateLocalPassport(prep);
  }
}

module.exports = { generatePassport };

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CurriculumPlan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    targetRole: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    skillGap: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    targetMastery: {
      type: DataTypes.INTEGER,
      defaultValue: 92,
    },
    masteryBreakdown: {
      type: DataTypes.JSON,
      defaultValue: { quizWeight: 0.4, exerciseWeight: 0.3, efficiencyWeight: 0.15, consistencyWeight: 0.15 },
    },
    modules: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    totalDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    progress: {
      type: DataTypes.JSON,
      defaultValue: { completed: 0, scores: [], timeSpent: 0, currentModule: 0 },
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
  });
};

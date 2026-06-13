module.exports = (sequelize, DataTypes) => {
  return sequelize.define('InterviewPrep', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      defaultValue: 'Unknown',
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    interviewDate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    resumeText: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    jdText: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    skillGapAnalysis: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    timeline: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    weakTopics: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    dsaQuestions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  });
};

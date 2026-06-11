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
    jdText: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    jdParsed: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    jdSummary: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    mode: {
      type: DataTypes.STRING,
      defaultValue: 'structured',
    },
    starQuestions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    oveQuestions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    answers: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    readinessScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    prepProgress: {
      type: DataTypes.JSON,
      defaultValue: { questionsAnswered: 0, avgScore: 0, weakAreas: [], sessionsCompleted: 0 },
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
    expiresAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    passport: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
  });
};

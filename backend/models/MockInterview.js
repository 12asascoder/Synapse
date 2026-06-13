module.exports = (sequelize, DataTypes) => {
  return sequelize.define('MockInterview', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    interviewPrepId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roundType: {
      type: DataTypes.STRING,
      defaultValue: 'technical',
    },
    questions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    responses: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    scores: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    overallScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    weakTopics: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'in_progress',
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  });
};

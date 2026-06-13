module.exports = (sequelize, DataTypes) => {
  return sequelize.define('MockInterview', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    interviewPrepId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    round: {
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
    topicScores: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    overallScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'in_progress',
    },
  });
};

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AssessmentQuestion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    correctAnswer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    topic: {
      type: DataTypes.STRING,
      defaultValue: 'general',
    },
    difficulty: {
      type: DataTypes.STRING,
      defaultValue: 'medium',
    },
  });
};

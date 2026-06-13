module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DSAAttempt', {
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
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.STRING,
      defaultValue: 'medium',
    },
    frequency: {
      type: DataTypes.STRING,
      defaultValue: 'common',
    },
    code: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'javascript',
    },
    isSolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    hintsUsed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    attemptNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  });
};

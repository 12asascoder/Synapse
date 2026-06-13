module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DSAAttempt', {
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
      allowNull: false,
    },
    questionTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      defaultValue: 'general',
    },
    difficulty: {
      type: DataTypes.STRING,
      defaultValue: 'medium',
    },
    frequency: {
      type: DataTypes.STRING,
      defaultValue: 'common',
    },
    questionUrl: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    solved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  });
};

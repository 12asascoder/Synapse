module.exports = (sequelize, DataTypes) => {
  return sequelize.define('WeakTopic', {
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
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    mastered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'mock-interview',
    },
  });
};

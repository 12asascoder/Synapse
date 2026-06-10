module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Assessment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    bootcampId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    day: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    scores: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    answers: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
};

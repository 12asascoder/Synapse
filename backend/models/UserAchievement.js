module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserAchievement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    achievementId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    earnedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
};

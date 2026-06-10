module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CommunityDiscussion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'general',
    },
    replies: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};

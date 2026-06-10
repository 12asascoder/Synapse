module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Achievement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: 'Award',
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#fbbf24',
    },
    criteria: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  });
};

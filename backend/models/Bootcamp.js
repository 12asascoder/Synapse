module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Bootcamp', {
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
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      defaultValue: 'Beginner',
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#6366f1',
    },
    outcomes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    cert: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CurriculumDay', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bootcampId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sublabel: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    contentType: {
      type: DataTypes.STRING,
      defaultValue: 'lesson',
    },
  });
};

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    resumeUrl: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    resumeParsed: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    githubUrl: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    portfolioUrl: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    goal: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    targetRole: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    targetCompany: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    interviewDeadline: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
    },
  });
};

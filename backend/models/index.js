const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const storagePath = process.env.DB_STORAGE
    ? path.resolve(__dirname, '..', process.env.DB_STORAGE)
    : path.resolve(__dirname, '..', 'synapse.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
} else {
  // PostgreSQL via DATABASE_URL (e.g. Supabase)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, DataTypes);
db.Progress = require('./Progress')(sequelize, DataTypes);
db.Bootcamp = require('./Bootcamp')(sequelize, DataTypes);
db.CurriculumDay = require('./CurriculumDay')(sequelize, DataTypes);
db.AssessmentQuestion = require('./AssessmentQuestion')(sequelize, DataTypes);
db.Assessment = require('./Assessment')(sequelize, DataTypes);
db.Achievement = require('./Achievement')(sequelize, DataTypes);
db.UserAchievement = require('./UserAchievement')(sequelize, DataTypes);
db.CommunityDiscussion = require('./CommunityDiscussion')(sequelize, DataTypes);
db.ChatMessage = require('./ChatMessage')(sequelize, DataTypes);
db.UserProfile = require('./UserProfile')(sequelize, DataTypes);

db.User.hasOne(db.Progress, { foreignKey: 'userId' });
db.Progress.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasOne(db.UserProfile, { foreignKey: 'userId' });
db.UserProfile.belongsTo(db.User, { foreignKey: 'userId' });

db.Bootcamp.hasMany(db.CurriculumDay, { foreignKey: 'bootcampId' });
db.CurriculumDay.belongsTo(db.Bootcamp, { foreignKey: 'bootcampId' });

db.User.belongsToMany(db.Achievement, { through: db.UserAchievement, foreignKey: 'userId' });
db.Achievement.belongsToMany(db.User, { through: db.UserAchievement, foreignKey: 'achievementId' });

db.User.hasMany(db.CommunityDiscussion, { foreignKey: 'userId' });
db.CommunityDiscussion.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.ChatMessage, { foreignKey: 'userId' });
db.ChatMessage.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;


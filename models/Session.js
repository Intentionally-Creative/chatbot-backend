const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');


const Session = sequelize.define('Session', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'gpt-3.5-turbo'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

module.exports = Session;

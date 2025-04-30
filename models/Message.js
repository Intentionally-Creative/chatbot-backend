const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Session = require('./Session');

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

Session.hasMany(Message, { foreignKey: 'sessionId' });
Message.belongsTo(Session, { foreignKey: 'sessionId' });

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

module.exports = Message;

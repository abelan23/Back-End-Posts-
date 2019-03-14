const bcrypt = require("bcryptjs");
const auth = require("../config/auth");

('use strict');
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define(
    'users',
  {
    UserId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    FirstName: DataTypes.STRING,
    LastName: DataTypes.STRING,
    Email: { 
      type: DataTypes.STRING,
      unique: true
    },
    Username: { 
      type: DataTypes.STRING,
      unique: true
    },
    Password: DataTypes.STRING,
    Admin: { 
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    AuthId: DataTypes.INTEGER,
    Deleted: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, 
  {}
);
  users.associate = function(models) {
    // associations can be defined here
  };

  users.prototype.comparePassword = function (plainTextPassword) {
    let user = this;
    console.log('users/models comparePassword');
    return bcrypt.compareSync(plainTextPassword, user.Password);
  };

  return users;
};
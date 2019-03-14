'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define(
    'posts', 
  {
    PostId: { 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
    },
    PostTitle: DataTypes.STRING,
    PostBody: DataTypes.STRING,
    Deleted: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, 
  {}
);

  posts.associate = function(models) {
    posts.belongsTo(models.users, {
      foreignKey: 'UserId'
    });
  };

  return posts;
};
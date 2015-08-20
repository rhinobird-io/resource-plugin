"use strict";

module.exports = function (sequelize, DataTypes) {
  var Resources = sequelize.define("Resources", {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    location: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.INTEGER
    }
  });
  return Resources;
};

'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.createTable('Resources', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        unique: true
      },
      description: {
        type: DataTypes.STRING
      },
      location: {
        type: DataTypes.STRING
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.DECIMAL)
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    });
  },

  down: function (migration, DataTypes) {
    migration.dropTable("Resources");
  }
};

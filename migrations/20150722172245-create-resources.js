'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration.createTable('Resources', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER
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
        type: DataTypes.ARRAY(DataTypes.STRING)
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
    return migration.dropTable("Resources");
  }
};

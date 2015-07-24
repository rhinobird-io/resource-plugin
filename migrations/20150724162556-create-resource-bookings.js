'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return migration.createTable('ResourceBookings', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      resourceId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Resources",
          key: "id"
        }
      },
      userId: {
        type: DataTypes.STRING
      },
      fromTime: {
        type: DataTypes.DATE
      },
      toTime: {
        type: DataTypes.DATE
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },

  down: function (migration, DataTypes) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return migration.dropTable("ResourceBookings");
  }
};

"use strict";

module.exports = function (sequelize, DataTypes) {
    var ResourceBookings = sequelize.define("ResourceBookings", {
        resourceId: {
            type: DataTypes.INTEGER,
            references: "Resources",
            referencesKey: "id"
        },
        userId: {
            type: DataTypes.STRING
        },
        fromTime: {
            type: DataTypes.DATE
        },
        toTime: {
            type: DataTypes.DATE
        }
    });
    return ResourceBookings;
};

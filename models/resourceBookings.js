"use strict";

module.exports = function (sequelize, DataTypes) {
    var ResourceBookings = sequelize.define("ResourceBookings", {
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
        }
    });
    return ResourceBookings;
};

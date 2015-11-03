'use strict';

/**
 * @module model/patient
 */

const Sequelize = require('sequelize');

/**
 * a Patient can have one or more Surveys
 * @typedef {Object} Patient
 * @property {String} name - patient name
 * @property {String} deviceType - Device Patient registered with
 * @property {String} deviceVersion - OS version of device used to register
 * @property {Date} dateStarted - Date Patient began the Trial
 * @property {Date} dateCompleted - Date Patient completed the Trial
 */

/**
 * Registers model with Sequelize
 * @function register
 * @param {Sequelize} sequelize - database instance
 * @returns {Null} nothing
 */
module.exports = function (sequelize) {
    sequelize.define('patient',
        {
            pin: {
                type: Sequelize.INTEGER,
                unique: true,
                allowNull: false
            },
            deviceType: {
                type: Sequelize.ENUM,
                values: ['android', 'ios', 'windows']
            },
            deviceVersion: {
                type: Sequelize.STRING,
                validate: {
                    is: /^[a-z0-9. ]+$/
                }
            },
            dateStarted: {
                type: Sequelize.DATE
            },
            dateCompleted: {
                type: Sequelize.DATE
            }
        },
        {
            freezeTableName: true,
            paranoid: true
        }
    );
};

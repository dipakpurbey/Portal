'use strict';

/**
 * @module rule/task/run-survey-rules
 */

const database = require('../../model');
const moment = require('moment');
const currentDate = new Date();
const zero = 0;
const one = 1;

/**
 * Runs rules for all patients in all trials for all stages.
 * Rules will generate Survey Instances that open the same day the rule engine is run.
 * @param {Object} configuration - database configuration
 * @returns {Promise} resolves when completed
 */
function runSurveyRules (configuration) {
    database.setup(configuration);

    return database
    .sequelize
    .query(
       `
       SELECT *, pa.id AS patientId
       FROM patient AS pa
       JOIN stage AS st
       ON st.id = pa.stageId
       JOIN join_stages_and_surveys AS jss
       ON jss.stageId = st.id
       WHERE pa.dateStarted < ?
       AND pa.dateCompleted > ?
       ORDER BY pa.id, jss.stagePriority
       `,
        {
            type: database.sequelize.QueryTypes.SELECT,
            replacements: [
                currentDate,
                currentDate
            ]
        }
    )
    .then((rules) => {
        const surveyInstances = rules.filter(activeRules).map(toSurveyInstanceData);

        return database
              .sequelize
              .model('survey_instance')
              .bulkCreate(surveyInstances);
    });
}

module.exports = runSurveyRules;

/**
 * Determines which rules should be used to create Survey Instances.
 * Supports up to two rules per stage, where one rule is active at a time.
 * @param {Object} current - a single rule record from the array.
 * @param {Number} index - location of the record in list.
 * @param {Array<Object>} rules - list all of the rule records
 * @returns {Boolean} true to keep record, false to remove
 */
function activeRules (current, index, rules) {
    if (index > zero) {
        const previous = rules[index - one];

        return isActive(current) && (
            !isSamePatient(previous, current)
            || isSamePatient(previous, current) && !isActive(previous)
        );
    }
    return isActive(current);
}

/**
 * Determines is a schedule rule should be active today.
 * Currently supports only daily and weekly rules, other rules are ignored.
 * Weekly rules are based off the day of the week the patient started in the trial.
 * @param {Object} rule - rule to check
 * @returns {Boolean} true for active, false for inactive
 */
function isActive (rule) {
    return rule.rule === 'daily' || rule.rule === 'weekly' && moment(rule.dateStarted).day() === moment().day();
}

/**
 * Determines if two rules belong to same patient
 * @param {Object} first - first rule
 * @param {Object} second - second rule
 * @returns {Boolean} true for same, false for different
 */
function isSamePatient (first, second) {
    return first.patientId === second.patientId;
}

/**
 * Takes a rule row and creates the survey_instance template
 * @param {Object} row - a single record
 * @returns {Object} a template for survey_instance creation.
 */
function toSurveyInstanceData (row) {
    let unit = null;

    if (row.rule === 'daily') {
        unit = 'day';
    } else {
        unit = 'week';
    }

    return {
        patientId: row.patientId,
        surveyTemplateId: row.surveyTemplateId,
        state: 'pending',
        startTime: moment()
            .startOf('day')
            .toDate(),
        endTime: moment()
            .startOf('day')
            .add(one, unit)
            .toDate()
    };
}
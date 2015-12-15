'use strict';

/**
 * @module controller/handler/survey
 */

const database = require('../../model');
const processSurvey = require('../helper/process-survey');
const first = 0;
const second = 1;

/**
 * A dashboard with an overview of a specific survey.
 * @param {Request} request - Hapi request
 * @param {Reply} reply - Hapi Reply
 * @returns {View} Rendered page
 */
function surveyView (request, reply) {
    Promise.all([
        database.sequelize.query(
            `
            SELECT *
            FROM survey_instance si
            JOIN survey_template st
            ON st.id = si.surveyTemplateId
            JOIN question_instance qi
            ON qi.surveyInstanceId = si.id
            JOIN question_template qt
            ON qt.id = qi.questionTemplateId
            JOIN question_option qo
            ON qo.id = qi.questionOptionId
            WHERE si.id = ?
            `,
            {
                type: database.sequelize.QueryTypes.SELECT,
                replacements: [
                    request.params.id
                ]
            }
        ),
        database.sequelize.query(
            `
            SELECT p.pin, t.id, t.name
            FROM survey_instance si
            JOIN patient p
            ON p.id = si.patientId
            JOIN trial t
            ON t.id = p.trialId
            WHERE si.id = ?
            `,
            {
                type: database.sequelize.QueryTypes.SELECT,
                replacements: [
                    request.params.id
                ]
            }
        )
    ])
    .then((data) => {
        const currentSurvey = data[first];
        const patientAndTrial = data[second][first];

        reply.view('survey', {
            title: 'Pain Reporting Portal',
            patient: {
                pin: patientAndTrial.pin
            },
            trial: {
                id: patientAndTrial.id,
                name: patientAndTrial.name
            },
            survey: processSurvey(currentSurvey)
        });
    })
    .catch(() => {
        reply.redirect('/404');
    });
}

module.exports = surveyView;

'use strict';

/**
 * @module api/handler/submit-survey
 */

const database = require('../../model');
const boom = require('boom');
const moment = require('moment');

/**
 * Fills in answered QuestionInstances for a submitted SurveyInstance
 * @param {Request} request - Hapi request
 * @param {Reply} reply - Hapi Reply
 * @returns {Null} responds with JSON data structure
 */
function submitSurvey (request, reply) {
    const questionResult = database.sequelize.model('question_result');
    const surveyInstance = database.sequelize.model('survey_instance');
    const questionOption = database.sequelize.model('question_option');
    const surveyInstanceId = request.payload.surveyInstanceID;
    const questionInstArr = [];

    let currentSurveyInstance = null;

    surveyInstance.find({
        where: {
            id: request.payload.surveyInstanceID,
            state: 'in progress'
        }
    })
    .then((survey) => {
        return new Promise((resolve, reject) => {
            if (survey) {
                if (moment() > survey.endTime) {
                    reject('Error - Survey has expired');
                } else {
                    currentSurveyInstance = survey;
                    resolve();
                }
            } else {
                reject('Either survey_instance does not exist or its already completed');
            }
        });
    })
    .then(() => {
        for (let index = 0; index < request.payload.surveyResults.length; index += 1) {
            const currentQuestion = request.payload.surveyResults[index];

            if (
                currentQuestion
                && currentQuestion.bodyPain
                && currentQuestion.bodyPain[0]
                && currentQuestion.bodyPain[0].location
            ) {
                questionInstArr.push(
                    questionOption.find({
                        where: {
                            optionText: currentQuestion.bodyPain[0].location
                        }
                    })
                    .then((data) => {
                        return questionResult.create({
                            surveyInstanceId,
                            questionOptionId: data.id
                        });
                    })
                );
                questionInstArr.push(
                    questionOption.find({
                        where: {
                            optionText: currentQuestion.bodyPain[0].intensity
                        }
                    })
                    .then((data) => {
                        return questionResult.create({
                            surveyInstanceId,
                            questionOptionId: data.id
                        });
                    })
                );
            } else {
                questionInstArr.push(
                   questionResult.create({
                       surveyInstanceId,
                       questionOptionId: currentQuestion.selectedOptions[0]
                   })
                );
            }
        }
        return Promise.all(questionInstArr);
    })
    .then(() => {
        currentSurveyInstance.userSubmissionTime = request.payload.timeStamp;
        currentSurveyInstance.actualSubmissionTime = moment();
        currentSurveyInstance.state = 'completed';
        currentSurveyInstance.save();
        reply({
            statusCode: 500,
            message: 'Success'
        });
    })
    .catch((err) => {
        console.error(err);
        reply(boom.badRequest(err));
    });
}

module.exports = submitSurvey;

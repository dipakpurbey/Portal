'use strict';

/**
 * @module controller/handler/create-patient
 */

const boom = require('boom');
const database = require('../../model');
const trialOffset = 1000;
const createSurvey = require('../../rule/task/create-survey');

/**
 * Creates a new Patient
 * @param {Request} request - Hapi request
 * @param {Reply} reply - Hapi Reply
 * @returns {Null} Redirect
 */
function createPatient (request, reply) {
    const patient = database.sequelize.model('patient');
    const trial = database.sequelize.model('trial');
    const stage = database.sequelize.model('stage');
    const joinStageSurveys = database.sequelize.model('join_stages_and_surveys');
    const opensIn = 0;
    const openFor = 7;
    const openUnit = 'day';
    let transaction = null;
    let newPatient = null;
    let pin = null;

    database.sequelize.transaction()
    .then((newTransaction) => {
        transaction = newTransaction;
        // Get Trial the patient will be added to
        return trial.findById(request.payload.trialId, {transaction});
    })

    // Get next availible Patient Pin
    .then((tempTrial) => {
        const currentTrial = tempTrial;

        pin = currentTrial.id * trialOffset + currentTrial.patientPinCounter;
        return currentTrial.increment({patientPinCounter: 1}, {transaction});
    })
    // Create the new Patient
    .then(() => {
        const dateStarted = request.payload.startDate;
        const dateCompleted = request.payload.endDate;

        return patient.create({pin, dateStarted, dateCompleted}, {transaction});
    })
    // Get stage that patient belongs to
    .then((tempPatient) => {
        newPatient = tempPatient;
        return stage.findById(request.payload.stageId, {transaction});
    })
    // Add patient to stage
    .then((currentStage) => {
        return currentStage.addPatient(newPatient, {transaction});
    })
    // Commit the transaction
    .then(() => {
        transaction.commit();
    })
    .catch((err) => {
        transaction.rollback();
        console.error(err);
        reply(boom.badRequest('Trial or Stage does not exist'));
    })
    // Collect the surveyTemplateId for the stage associated to the patient
    .then(() => {
        return joinStageSurveys.findOne({
            where: {
                stageId: request.payload.stageId
            }
        });
    })
    // Create first survey instance as per the surveyTemplateId for the patient
    .then((data) => {
        return createSurvey(
            pin,
            data.surveyTemplateId,
            opensIn,
            openFor,
            openUnit
        );
    })
    .then(() => {
        reply.redirect(`/patient/${newPatient.pin}`);
    })
    .catch((err) => {
        console.error(err);
        reply(boom.badRequest('Survey Instance could not be generated'));
    });
}

module.exports = createPatient;

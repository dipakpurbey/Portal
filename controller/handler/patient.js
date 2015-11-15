'use strict';

/**
 * @module presenter/patient
 */

const color = require('colors.css');

const surveys = [
    {
        id: 1234,
        title: 'Monthly',
        stage: 1,
        surveyType: 'Monthly',
        start: '11/15/2015',
        end: '11/15/2015',
        userSubmissionTime: '11/15/2015 15:43:35',
        completed: true,
        color: color.green
    },
    {
        id: 1234,
        title: 'Daily',
        stage: 1,
        surveyType: 'Daily',
        start: '11/15/2015',
        end: '11/15/2015',
        userSubmissionTime: '11/15/2015 15:43:35',
        completed: true,
        color: color.green
    },
    {
        id: 2345,
        title: 'Daily',
        stage: 1,
        surveyType: 'Daily',
        start: '11/16/2015',
        end: '11/16/2015',
        userSubmissionTime: '11/16/2015 13:11:15',
        completed: true,
        color: color.green
    },
    {
        id: 3456,
        title: 'Daily',
        stage: 1,
        surveyType: 'Weekly',
        start: '11/17/2015',
        end: '11/17/2015',
        userSubmissionTime: '11/17/2015 11:12:43',
        completed: true,
        color: color.green
    },
    {
        id: 3456,
        title: 'Weekly',
        stage: 1,
        surveyType: 'Weekly',
        start: '11/18/2015',
        end: '11/18/2015',
        userSubmissionTime: 'N/A',
        completed: false,
        color: color.red
    },
    {
        id: 4567,
        title: 'Daily',
        stage: 1,
        surveyType: 'Daily',
        start: '11/18/2015',
        end: '11/18/2015',
        userSubmissionTime: 'N/A',
        completed: false,
        color: color.red
    },
    {
        id: 5678,
        title: 'Daily',
        stage: 1,
        surveyType: 'Daily',
        start: '11/19/2015',
        end: '11/19/2015',
        userSubmissionTime: '11/19/2015 05:56:11',
        completed: true,
        color: color.green
    },
    {
        id: 5678,
        title: 'Daily',
        stage: 1,
        surveyType: 'Daily',
        start: '11/20/2015',
        end: '11/20/2015',
        userSubmissionTime: '11/20/2015 05:56:11',
        completed: true,
        color: color.green
    },
    {
        id: 5678,
        title: 'Daily',
        stage: 1,
        surveyType: 'Daily',
        start: '11/21/2015',
        end: '11/21/2015',
        userSubmissionTime: 'N/A',
        completed: false,
        color: color.red
    }
];


/**
 * A dashboard with an overview of a specific patient.
 * @function patient
 * @param {Request} request - Hapi request
 * @param {Reply} reply - Hapi Reply
 * @returns {View} Rendered page
 */
module.exports = function (request, reply) {
    reply.view('patient', {
        title: 'Pain Reporting Portal',
        patient: {
            id: 1234,
            start: '08/25/2015',
            duration: '60 days',
            patientCount: 1023,
            noncompliantCount: 8
        },
        trial: {
            id: 1,
            name: 'test'
        },
        surveys: surveys,
        surveysJson: JSON.stringify(surveys)
    });
};

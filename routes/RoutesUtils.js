const RequestError = require('../models/error/RequestError');

function getErrorStatusCodeAndMessage(error) {
    if (error.constructor === RequestError) {
        return {statusCode: 400, message: error.message};
    } else {
        return {statusCode: 500, message: 'Something went wrong.'};
    }
}

function respondError(res, err) {
    const {statusCode, message} = getErrorStatusCodeAndMessage(err);
    res.status(statusCode).send(message);
}

module.exports = {
    respondError
};

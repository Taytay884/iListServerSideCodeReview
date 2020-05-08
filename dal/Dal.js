const mongo = require('../services/mongo');
const RequestError = require('../models/error/RequestError');

class Dal {
    constructor() {
        this.mongo = mongo;
        this.RequestError = RequestError;
    }
}

module.exports = Dal;

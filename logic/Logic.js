'use strict';

const DataAccessLayer = require('../dal');

class Logic {
    constructor() {
        this.Dal = DataAccessLayer;
    }

    async handleDalError(func, args) {
        try {
            return await func(...args);
        } catch (err) {
            return Promise.resolve({serverError: err})
        }
    }
}

module.exports = Logic;

'use strict';

const { isUuid } = require('uuidv4');

class LogicUtils {
    static validateUuid(uuid) {
        return isUuid(uuid);
    }
}

module.exports = LogicUtils;

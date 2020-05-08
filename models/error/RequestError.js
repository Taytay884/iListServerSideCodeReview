class RequestError extends Error {
    constructor(message) {
        super();
        this.message = message;
        this.name = 'RequestError';
    }
}

module.exports = RequestError;

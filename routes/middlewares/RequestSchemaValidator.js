const Joi = require('joi');

const defaultJoiValidationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true // remove unknown keys from the validated data
};

module.exports = class RequestSchemaValidator {

    constructor(schemas, reqPropertyToValidate) {
        this.schemas = schemas;
        this.reqProperty = reqPropertyToValidate;
        this.customError = 'Invalid request data. Please review request and try again.';
        this.joiValidationOptions = defaultJoiValidationOptions;
    }

    validate(useJoiError) {
        return (req, res, next) => {
            const route = req.route.path;
            if (this.schemas.hasOwnProperty(route)) {
                return Joi.validate(req[this.reqProperty], this.schemas[route], this.joiValidationOptions, (err, data) => {
                    if (err) {
                        res.status(422).send(useJoiError ? this.getJoiError(err) : this.customError);
                    } else {
                        req[this.reqProperty] = data;
                        next();
                    }
                });
            } else {
                res.status(422).send(`Missing route "${route}" on Schema.`);
            }
        }
    };

    setCustomError(customError) {
        this.customError = customError;
    }

    getJoiError(err) {
        return err.details.map(({message}) => {
           return message;
        }).join((', '));
    }
};

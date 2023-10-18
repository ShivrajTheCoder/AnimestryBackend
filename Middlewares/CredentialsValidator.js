const { validationResult } = require('express-validator')
const { CredentialError } = require('../Utilities/CustomErrors')

exports.routeCredentialValidator = (req, res, next) => {
    if (!validationResult(req).isEmpty()) {
        const result = validationResult(req).errors[0]
        throw new CredentialError(result.value)
    } else return next()
}
const { requestBody, requiredString } = require('../../http/validate');

const MISSING_FIELDS = 'Missing required fields: username, password';

const loginBody = requestBody({
    username: requiredString('username', MISSING_FIELDS),
    password: requiredString('password', MISSING_FIELDS),
}, 'Missing required field: body');

module.exports = {
    loginBody,
};

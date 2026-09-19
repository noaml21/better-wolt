const mongoose = require('mongoose');
const { z } = require('zod');
const { AppError } = require('./errors');

// Validates req.body against a Zod schema. The first issue's message becomes
// a 400 { error }, and req.body is replaced by the parsed value (unknown
// fields dropped). Schemas define their own messages, including the one for
// a missing body.
function validate({ body }) {
    return (req, res, next) => {
        const result = body.safeParse(req.body);

        if (!result.success) {
            return next(new AppError(400, result.error.issues[0].message));
        }

        req.body = result.data;
        return next();
    };
}

// A path id that cannot be an ObjectId can never match a document, so it gets
// the same 404 (and message) as a well-formed id that matches nothing.
function objectIdParam(name, notFoundMessage) {
    return (req, res, next) => {
        if (!mongoose.isValidObjectId(req.params[name])) {
            return next(new AppError(404, notFoundMessage));
        }

        return next();
    };
}

// Schema building blocks shared by the feature *.schemas.js files.

// A body that is missing or not a JSON object gets `missingMessage`.
function requestBody(shape, missingMessage) {
    return z.object(shape, { error: () => missingMessage });
}

// Required string: absent, null or '' -> `missingMessage` (the same test as the
// old `if (!field)` checks); any other non-string -> "<field> must be a string".
function requiredString(field, missingMessage) {
    return z
        .string({ error: (issue) => (issue.input == null ? missingMessage : `${field} must be a string`) })
        .min(1, missingMessage);
}

// Optional string: absent or null is fine; any other non-string is rejected.
function optionalString(field) {
    return z.string({ error: `${field} must be a string` }).nullish();
}

module.exports = {
    validate,
    objectIdParam,
    requestBody,
    requiredString,
    optionalString,
};

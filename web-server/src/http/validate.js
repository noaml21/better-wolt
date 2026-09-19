const mongoose = require('mongoose');
const { AppError } = require('./errors');

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

module.exports = {
    objectIdParam,
};

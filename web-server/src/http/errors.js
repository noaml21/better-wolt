// Expected failures (bad input, not found, forbidden, ...). Anything thrown
// with this class is sent to the client as { error: message } with `status`.
class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

module.exports = {
    AppError,
};

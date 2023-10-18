exports.RouterAsncErrorHandler = (middleware) => (req, res, next) => Promise.resolve(middleware(req, res, next)).catch(next)


exports.ErrorHandlerMiddleware = (error, req, res, next) => {
    let type = "InternalServerError";
    let message = "Something went wrong!";
    let code = 500; // Assign a default value

    if (error.code === 11000) {
        type = "DuplicateDataError";
        message = `${Object.values(error.keyValue)[0]} already exists.`;
    } else {
        type = error.type || type; // Use a default value if error.type is not defined
        message=error.message||message;
        code = error.status || code; // Use a default value if error.status is not defined
    }

    console.error(error);

    return res.status(code).json({
        type,
        message,
        error
    });
}

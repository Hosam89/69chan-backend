// middleware function for handling errors passed to the error stack trace
module.exports.errorHandler = (err, req, res, next) => {
    // console log the gathered error stack trace first.
    // this is good for a general contextual overview.
    console.error(err.stack);

    // followed by the appropriate status response.
    switch (err.status) {
        case 400:
            res.status(400).json({ message: err.message || 'Bad Request!' })
            break;
        case 401:
            res.status(401).json({ message: err.message || 'Unauthorized!' })
            break;
        case 403:
            res.status(403).json({ message: err.message || 'Forbidden!' })
            break;
        case 404:
            res.status(404).json({ message: err.message || 'Not Found!' })
            break;
        case 409:
            res.status(409).json({ message: err.message || 'Conflict!' })
            break;
        case 422:
            res.status(422).json({ message: err.message || 'Unprocessable Entity!' })
            break;
        case 500:
            res.status(500).json({ message: err.message || 'Internal Server Error!' })
            break;
    }
};
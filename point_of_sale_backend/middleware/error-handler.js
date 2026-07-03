// error handler.js
module.exports = (err, req, res, next) => {
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    const statusCode = err.statusCode || err.status || 500;
    return res.status(statusCode).json({
        message: err.message || 'Internal server error'
    });
};

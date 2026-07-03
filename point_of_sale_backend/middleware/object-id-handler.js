const mongoose = require('mongoose');

function isValidObjectId(value) {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

function validateObjectIdParam(paramName, label = paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!isValidObjectId(value)) {
      return res.status(400).json({ message: `Invalid ${label} id` });
    }

    next();
  };
}

function validateObjectIdField(location, fieldName, message) {
  return (req, res, next) => {
    const source = location === 'query' ? req.query : req.body;
    const value = source[fieldName];

    if (value !== undefined && !isValidObjectId(value)) {
      return res.status(400).json({ message: message || `${fieldName} must be a valid ObjectId` });
    }

    next();
  };
}

module.exports = {
  isValidObjectId,
  validateObjectIdParam,
  validateObjectIdField,
};

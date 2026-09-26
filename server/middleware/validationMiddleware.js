const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!value || !isValidObjectId(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
      });
    }

    next();
  };
};

const validateBodyObjectId = (fieldName) => {
  return (req, res, next) => {
    const value = req.body[fieldName];

    if (value !== undefined && value !== null && value !== '') {
      if (!isValidObjectId(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${fieldName}`,
        });
      }
    }

    next();
  };
};

const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter((field) => {
      const value = req.body[field];

      return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && !value.trim())
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  isValidObjectId,
  validateObjectId,
  validateBodyObjectId,
  validateRequiredFields,
};
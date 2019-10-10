/**
 * Error handler central para nossa aplicação Express.
 * 
 * @class ErrorHandler
 * @see https://dev.to/nedsoft/central-error-handling-in-express-3aej
 */
class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

/**
 * Lida com o erro.
 * 
 * @function handleError
 * @param {Object} err 
 * @param {Object} res 
 */
const handleError = (err, res) => {
  const { statusCode, message } = err;
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message
  });
};

module.exports = {
  ErrorHandler,
  handleError
};

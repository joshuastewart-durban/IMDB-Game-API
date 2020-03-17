class ErrorHandler extends Error {
  constructor(message) {
    super();
    this.message = message;
  }
}
module.exports = {
  ErrorHandler
};

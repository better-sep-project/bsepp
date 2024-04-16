class InvalidArgError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidArgumentError";
  }
}

module.exports = InvalidArgError;

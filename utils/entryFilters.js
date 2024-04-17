const InvalidArgumentError = require("../errors/InvalidArgError");

/**
 * Class to represent filters for searching entries.
 */
class EntryFilters {
  constructor(title, authors, afterDate, beforeDate) {
    this.title = this._validateTitle(title);
    this.authors = this._validateAuthors(authors);
    this.afterDate = this._validateDate(afterDate);
    this.beforeDate = this._validateDate(beforeDate);

    this._validateDateOrder();
  }

  _validateTitle(title) {
    if (typeof title !== "string") {
      console.error(
        `Title must be a string. Title="${title}", type="${typeof title}"`
      );
      throw new InvalidArgumentError("Title must be a string.");
    }

    if (title.length === 0) {
      throw new InvalidArgumentError("Title must not be empty.");
    }

    if (title.length > 100) {
      throw new InvalidArgumentError("Title must not exceed 100 characters.");
    }

    return title;
  }

  _validateAuthors(authors) {
    if (authors === undefined) {
      return authors;
    }

    if (!authors.every((item) => typeof item === "string" && item.length > 0)) {
      throw new InvalidArgumentError(
        "Authors must be an array of non-empty strings."
      );
    }

    return authors;
  }

  _validateDate(date) {
    if (date === undefined) {
      return date;
    }

    if (date && isNaN(Date.parse(date))) {
      throw new InvalidArgumentError("Invalid date format.");
    }

    return date;
  }

  _validateDateOrder() {
    if (this.afterDate && this.beforeDate && this.afterDate > this.beforeDate) {
      throw new InvalidArgumentError("After date must be before before date.");
    }
  }
}

module.exports = EntryFilters;

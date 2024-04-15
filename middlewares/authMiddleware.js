// Handles authentication middleware. Kinds:
// - requireAuth: requires a user to be logged in
// - requireNotAuth: requires a user to be logged out

const UserModel = require("../model/UserModel");

// requireAuth middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    console.log("Unauthorized; user:", req.session.user);
    res.status(401).send({
        success: false,
        message: "Unauthorized",
    });
  }
};

// requireNotAuth middleware
const requireNoAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

module.exports = {
  requireAuth,
  requireNoAuth,
};

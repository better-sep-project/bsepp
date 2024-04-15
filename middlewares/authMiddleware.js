const roles = require("../data/roles.json");

/**
 * Require the user to be authenticated
 */
exports.requireAuth = (req, res, next) => {
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

/**
 * Require the user to be unauthenticated
 */
exports.requireNoAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

/**
 * Require a role
 * Authorization implicitly required
 * Prefer to use requirePermission instead
 * @param {string} role
 */
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === role) {
      next();
    } else {
      res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
  };
};

/**
 * Requires permission(s)
 * Accept any number of arguments
 * Authorization implicitly required
 * @param  {...string} permissions
 */
exports.requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (
      req.session &&
      req.session.user &&
      permissions.some((permission) =>
        req.session.user.permissions.includes(permission)
      )
    ) {
      next();
    } else {
      res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
  };
};

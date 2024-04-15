const { hasRole, hasPermission } = require("../services/roleService");

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
 * Require a role
 * Authorization implicitly required
 * Prefer to use requirePermission instead
 * @param {string} role
 */
exports.requireRole = (role) => {
  return async (req, res, next) => {
    // 1. verify that the user is authenticated
    // 2. get the userid from the session
    // 3. check if the user has the role
    if (req.session && req.session.user) {
      const userId = req.session.user;
      if (await hasRole(userId, role)) {
        console.log("User has role", role);
        return next();
      } else {
        console.log("User does not have role", role);
      }
    }

    console.log("Unauthorized; user:", req.session.user);

    res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  };
};

/**
 * Requires permission(s)
 * Accept any number of arguments
 * Authorization implicitly required
 *
 * Works by getting the role, and checking if the user has the permission in `roles.json`
 * @param  {...string} permissions
 */
exports.requirePermission = (...permissions) => {
  return async (req, res, next) => {
    if (req.session && req.session.user) {
      const userId = req.session.user;
      console.log("Checking permissions for", userId);
      if (await hasPermission(userId, ...permissions)) {
        return next();
      }
    }
    
    res.status(401).send({
      success: false,
      message: "Unauthorized",
    })
  };
};

const roles = require("../data/roles.json");
const UserModel = require("../model/UserModel");

/**
 * Check if a user has permission(s).
 * @param {string} userId
 * @param  {...string} permissions
 */
exports.hasPermission = async (userId, ...permissions) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    return false;
  }
  console.log(
    `Checking if user ${user} has permissions ${permissions}...`
  );
  const role = user.role;
  const userPermissions = roles[role].permissions;
  for (const permission of permissions) {
    if (!userPermissions.includes(permission)) {
      return false;
    }
  }
  return true;
};

/**
 * Check if the user has a role
 * @param {string} userId
 * @param {string} role
 */
exports.hasRole = async (userId, role) => {
  console.log(`Checking if user ${userId} has role ${role}...`);
  const user = await UserModel.findById(userId).select("role").exec();
  if (!user) {
    return false;
  }
  console.log(`User role: ${user.role}, hasRole: ${user.role === role}`);
  return user.role === role;
};

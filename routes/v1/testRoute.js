const express = require("express");
const router = express.Router();
const testController = require("../../controllers/testController");
const { requireAuth, requireRole, requirePermission } = require("../../middlewares/authMiddleware");

router.get("/", testController.ping);
router.get("/isAuth", requireAuth, testController.ping);
router.get("/isElevated", requireRole("elevated"), testController.ping);
router.get("/canReadContent", requirePermission("readContent"), testController.ping);

module.exports = router;

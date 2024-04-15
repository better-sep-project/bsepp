const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");
const { requireNoAuth } = require("../../middlewares/authMiddleware");

router.post("/login", authController.login);
router.post("/logout", requireNoAuth, authController.logout);
router.post("/register", requireNoAuth, authController.register);

module.exports = router;

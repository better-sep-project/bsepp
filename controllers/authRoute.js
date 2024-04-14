const express = require("express");
const { requireAuth, requireNoAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", requireNoAuth, async (req, res) => {
  // get user data
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ username, password }).exec();
    if (user) {
      req.session.userId = user._id;
      res.status(200).send({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } else {
      res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send({
        success: false,
        message: "Internal server error",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Logout successful",
      });
    }
  });
});

router.post("/register", requireNoAuth, async (req, res) => {
  // get user data
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email })
      .select("email")
      .exec();

    if (existingUser) {
      res.status(400).send({
        success: false,
        message: "User already exists",
      });
    } else {
      const newUser = new UserModel({ username, password });
      await newUser
        .save()
        .then(() => {
          res.status(201).send({
            success: true,
            message: "User created",
            user: {
              id: newUser._id,
              email: newUser.email,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
            },
          });
        })
        .catch((err) => {
          res.status(400).send({
            success: false,
            message: err.message,
          });
        });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

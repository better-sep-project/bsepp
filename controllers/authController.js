const UserModel = require("../model/UserModel");

exports.login = async (req, res) => {
  // get user data
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email })
    .select("email password salt firstName lastName")
    .exec();
  if (!user) {
    return res.status(401).send({
      success: false,
      message: "Invalid credentials",
    });
  }

  if (!user.comparePassword(password)) {
    return res.status(401).send({
      success: false,
      message: "Invalid credentials",
    });
  }

  req.session.user = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  res.status(200).send({
    success: true,
    message: "Login successful",
    user: req.session.user,
  });
};

exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send({
        success: false,
        message: "Internal server error",
      });
      console.log(error);
    } else {
      res.status(200).send({
        success: true,
        message: "Logout successful",
      });
    }
  });
};

exports.register = async (req, res) => {
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
      const newUser = new UserModel({
        email,
        password,
        firstName,
        lastName,
      });
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
    console.log(error);
  }
};

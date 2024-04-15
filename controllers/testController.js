exports.ping = (req, res) => {
  res.status(200).send({
    success: true,
    message: "pong",
  });
};

exports.isAuth = (req, res) => {
  res.status(200).send({
    success: true,
    message: "Authenticated",
  });
};

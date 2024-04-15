exports.ping = (req, res) => {
  res.status(200).send({
    success: true,
    message: "pong",
  });
};
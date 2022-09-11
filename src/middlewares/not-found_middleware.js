const statusCode = require("http-status-codes");
const notFoundRoute = (req, res) =>
  res.status(404).json({
    status: statusCode.StatusCodes.NOT_FOUND,
    message: "Route does not exist",
  });

module.exports = notFoundRoute;

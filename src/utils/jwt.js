const jwt = require("jsonwebtoken");
const generateJwtToken = (userId) => {
  // const token = jwt.sign({ data: userId }, "PraGna", { expiresIn: 60 * 60 });
  const token = jwt.sign({ data: userId }, "PraGna", { expiresIn: 1600 * 160 });
  return token;
};
module.exports = generateJwtToken;

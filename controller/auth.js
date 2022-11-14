let jwt = require("jsonwebtoken");
let secret = "ehjfbheruyf";

function generateToken(user) {
  let payload = {
    email: user.email,
    password: user.password,
  };
  return jwt.sign(payload, secret);
}

function checkToken(token) {
  try {
    let result = jwt.verify(token, secret);
    return result;
  } catch (error) {
    return false;
  }
}

module.exports = { generateToken, checkToken };

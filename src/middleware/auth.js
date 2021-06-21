const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; //getting cookies
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY); //verifying user
    //console.log(verifyUser);

    const user = await Register.findOne({ _id: verifyUser._id }); //comparing tokens by id
    //console.log(user);

    //getting user data after verifying
    req.token = token;
    req.user = user;

    next(); //continue rendering
  } catch (error) {
    res.status(401).send(error);
  }
};
module.exports = auth;

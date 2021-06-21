const mongoose = require("mongoose"); //requiring mongoose
const bcrypt = require("bcryptjs"); //requiring bcryptjs
const jwt = require("jsonwebtoken");

const userRegistration = new mongoose.Schema({
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  gender: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  confirmpassword: {
    type: String,
    require: true,
  },
  //use name tokens only
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//generation token

//when using instance we use methods
//when using collection we use statics

userRegistration.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: token }); //object destructuring
    await this.save(); //saving token in db
    //console.log(token);
    return token;
  } catch (error) {
    res.send(error);
    // console.log("the error part" + error);
  }
};

//middleware using for secure password befor saving
//converting password into hash
userRegistration.pre("save", async function (next) {
  //only for password
  if (this.isModified("password")) {
    // console.log(`the current password is ${this.password}`); //password before hashing
    this.password = await bcrypt.hash(this.password, 10); //hashing password
    // console.log(`the current password is ${this.password}`); //password after hashing

    this.confirmpassword = await bcrypt.hash(this.password, 10); //hashing password
    //this.confirmpassword = undefined; //not storing confirm password
  }
  next();
});

//creation collection
const Register = new mongoose.model("Register", userRegistration);

module.exports = Register;

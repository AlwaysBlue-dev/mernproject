require("dotenv").config(); //requiring dotenv always on top
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs"); //requiring bcryptjs
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/conn"); //require for db connection
const Register = require("./models/registers"); //require for schema and collection

//static path to use css
const static_path = path.join(__dirname, "../public");
//console.log(path.join(__dirname, "../public"));

//templates path
const templates_path = path.join(__dirname, "../templates/views");

//partials path
const partials_path = path.join(__dirname, "../templates/partials");

//getting data and handle by express
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//giving static path to use css
app.use(express.static(static_path));

//setting view engine for dynamic website
app.set("view engine", "hbs");

//giving new directory name path
app.set("views", templates_path);

//registering partials and giving path to use
hbs.registerPartials(partials_path);

//console.log(process.env.SECRET_KEY);

//getting home page
app.get("/", (req, res) => {
  res.render("index");
});
//secret page
//using auth for checking use login or not
app.get("/secret", auth, (req, res) => {
  //console.log(`this is the cookie ${req.cookies.jwt}`);//getting cookie
  res.render("secret");
});

//getting register page
app.get("/register", (req, res) => {
  res.render("register");
});

//create new user in our db
app.post("/register", async (req, res) => {
  try {
    //getting data which user type
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    //condition
    if (password === cpassword) {
      //getting data which user type
      const registerUser = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        password: password,
        confirmpassword: cpassword,
      });

      // console.log("the success part" + registerUser)

      //calling genrate token function
      const token = await registerUser.generateAuthToken();
      // console.log("the token part" + token);

      //---using cookie in-build in nodejs---
      //The res.cookie() function is used to set the cookie name to value.
      //The value parameter may be string or object converted to JSON.
      //syntax: res.cookie(name, value, [options])
      //options: expires:new Date(Date.now() + 30000) --> expires in 3second,
      //httpOnly:true, --> can not remove by client side
      //secure:true --> run in https in only
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 30000),
        httpOnly: true,
      });
      //console.log(cookie);

      //saving data in db
      const registered = await registerUser.save();
      res.status(201).render("index");
    } else {
      res.send("Passwords are not matching");
    }
    // console.log(req.body.firstname);
    // res.send(req.body.firstname);
  } catch (error) {
    res.status(400).send(error);
  }
});

//getting login page
app.get("/login", (req, res) => {
  res.render("login");
});

//getting and functioning logout page
app.get("/logout", auth, async (req, res) => {
  try {
    //console.log(req.user);//user data

    //---for single logout---
    //using filter method
    //removing specific token
    //logout from current device
    // req.user.tokens = req.user.tokens.filter((currElement) => {
    //   return currElement.token !== req.token; //if matching current token it will logout current device
    // });

    //---for logout from all devices---
    req.user.tokens = [];

    res.clearCookie("jwt"); //clearing cookie it will log out
    //console.log("Log out successfully");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

//login check
app.post("/login", async (req, res) => {
  try {
    //getting data which user type
    const email = req.body.email;
    const password = req.body.password;
    //console.log(`email: ${email} password: ${password}`)

    const useremail = await Register.findOne({ email: email }); //object destructuring

    //comparing user enter password with db password
    const passwordMatch = await bcrypt.compare(password, useremail.password);
    //calling genrate token function
    const token = await useremail.generateAuthToken();
    //console.log("the token part" + token);

    //---using cookie in-build in nodejs---
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    });
    //console.log(cookie);

    if (passwordMatch) {
      res.status(201).render("index");
    } else {
      res.send("Invalid login details");
    }
    //console.log(useremail);
  } catch (error) {
    res.status(400).send("Invalid login details");
  }
});

app.listen(port, () => {
  console.log(`connection established at port ${port}`);
});


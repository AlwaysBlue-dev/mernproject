require("dotenv").config(); //requiring dotenv always on top
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs"); //requiring bcryptjs

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

//login validation
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

//---for understanding---

//---bcrypt---
//requiring bcryptjs
//const bcrypt = require("bcryptjs");

//  const securePassword = async (password) => {
//   const passwordHash = await bcrypt.hash(password, 10);
//   console.log(passwordHash);

//   //comparing user enter password with db password
//   const passwordMatch = await bcrypt.compare(password, passwordHash);
//   console.log(passwordMatch);
// };
// securePassword("abd@123");

//Encryption
//two-way communication
//abd -> hik
//hik -> abd
//encryption can easily decode because it is two way communication

//Hashing Algorithm
//one way communication
//abd -> 4911e516e5aa21d327512e0c8b197616

//using bcrypt hashing algorithm it is the strongest one.
//in .hash 1st argument is the password which use enter
//in. hash 2nd argument is the rounds to secure by default its 10

//---json web token for authentication
// const jwt = require("jsonwebtoken");//requiring token

// //creating token for user authentication
// //1st argument is something from your db
// //2nd argument is secret key which sholud be minimum 32 charaacters more longer more better.
// //3rd argument is optional and use for expire token "expiresIn"
// const createToken = async () => {
//   const token = await jwt.sign({ _id: "60ce4143858160058c1596f3" },"mynameismirzaabdullahbaigiamacomputersciencestudent",{
//     expiresIn:"2 seconds"
//   } );
//      const userVer = await jwt.verify(token,"mynameismirzaabdullahbaigiamacomputersciencestudent" )
//     //console.log(token);
//     //console.log(userVer);
// };
// createToken();

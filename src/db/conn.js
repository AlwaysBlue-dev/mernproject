const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/usersRegistraion", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("data base connection successfull");
  })
  .catch((e) => {
    console.log(e);
  });

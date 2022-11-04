var express = require("express");
var router = express.Router();
const userModel = require("../models/user.model");
let bcrypt = require("bcryptjs");
let auth = require("../controller/auth");

// /* GET users listing. */
// router.get("/", function (req, res, next) {
//   res.send("respond with a resource");
// });

router.post("/signin", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let users = await userModel.find().where({ email: email });
  if (users.length > 0) {
    // let comparisonResult = await bcrypt.compare(password, users[0].password);
    console.log(password, users[0].password);
    let comparisonResult = password === users[0].password ? true : false;
    if (comparisonResult) {
      let token = auth.generateToken(users[0]);
      res.cookie("auth_token", token);
      res.send({
        redirectURL: "/",
        message: "correct email",
      });
    } else {
      // res.send({
      //   redirectURL: "/",
      //   message: "wrong password",
      // });
      console.log("wrong password");
    }
  } else {
    console.log("wrong email");
  }
});

router.post("/signup", async (req, res) => {
  //check if the user registered before
  var newUser = new userModel();
  newUser.name = req.body.name;
  newUser.lastname = req.body.lastname;
  newUser.email = req.body.email;
  // newUser.password = await bcrypt.hash(req.body.password, 12);
  newUser.password = req.body.password;
  newUser.status = true;

  let users = await userModel.find().where({ email: newUser.email });
  if (users.length === 0) {
    await newUser.save(function (err, data) {
      if (err) {
        console.log(error);
      } else {
        res.send({
          redirectURL: "/signin",
          message: "data inserted",
        });
      }
    });
  } else {
    res.send({ message: "Rejected" });
  }
  //res.send("Login page");
});

router.get("/profile/:email", async function (req, res) {
  let email = req.params.email;
  console.log(email);
  console.log("profile");

  let users = await userModel.find().where({ email: email });
  console.log(users);
  if (users.length > 0) {
    res.send({
      message: users,
    });
  } else {
    console.log("wrong email");
  }
});

router.put("/update", async function (req, res) {
  // let email = req.body.email;
  // let oldPassword = req.body.oldpassword;
  let newPassword = req.body.newpassword;
  let oldPassword = req.body.oldpassword;
  let email = req.body.email;
  console.log(newPassword, oldPassword);

  let users = await userModel.find().where({ email: email });
  if (users.length > 0) {
    let comparisonResult = oldPassword === users[0].password ? true : false;
    if (comparisonResult) {
      let query = { email: email };
      let newValue = { $set: { password: newPassword } };

      userModel.updateOne(query, newValue, () => {
        console.log(query, newValue);

        console.log("1 document updated");
      });
    } else {
      console.log("wrong password");
    }
  } else {
    console.log("wrong email");
  }

  // let newPassword = await bcrypt.hash(req.body.newpassword, 12);

  // let users = await userModel.find().where({ email: email });
  // if (users.length > 0) {
  //   console.log(oldPassword, users[0].password);
  //   let comparisonResult = await bcrypt.compare(oldPassword, users[0].password);
  //   console.log(comparisonResult);
  // } else {
  //   console.log("wrong email");
  // }
});

router.delete("/delete", async function (req, res) {
  let email = req.body.email;

  let users = await userModel.find().where({ email: email });
  if (users.length > 0) {
    let query = { email: email };
    let newValue = { $set: { status: false } };

    userModel.deleteOne(query, () => {
      console.log(query, newValue);

      console.log("1 document updated");
    });
  } else {
    console.log("wrong email");
  }
});

// router.post("save", function (req, res) {
//   var newUser = new userModel();
//   newUser.name = req.body.name;
//   newUser.lastname = req.body.lastname;
//   newUser.email = req.body.email;
//   newUser.password = req.body.password;

//   newUser.save(function (err, data) {
//     if (err) {
//       console.log(error);
//     } else {
//       res.send("Data inserted");
//     }
//   });
// });

module.exports = router;

// tes 12 12 12

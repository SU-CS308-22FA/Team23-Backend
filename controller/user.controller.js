const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
let auth = require("../controller/auth");
let bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const { MongoClient, MongoGridFSChunkError } = require("mongodb");
const userModel = require("../models/user.model");
const teamModel = require("../models/team.model");
const catchAsync = require("./../utils/catchAsync");

exports.signup = catchAsync(async (req, res, next) => {
  var newUser = new userModel();
  newUser.name = req.body.name;
  newUser.lastname = req.body.lastname;
  newUser.email = req.body.email;
  // newUser.password = await bcrypt.hash(req.body.password, 12);
  newUser.password = req.body.password;
  newUser.products = [];
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
});

exports.signin = catchAsync(async (req, res, next) => {
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

exports.profile = catchAsync(async (req, res, next) => {
  //get operation
  let email = req.params.email;
  console.log(email);
  console.log("profile");

  let users = await userModel.find().where({ email: email });
  //console.log(users);
  if (users.length > 0) {
    res.send({
      message: users,
    });
  } else {
    console.log("wrong email");
  }
});

exports.update = catchAsync(async (req, res, next) => {
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

exports.delete = catchAsync(async (req, res, next) => {
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


exports.team = catchAsync(async (req, res, next) => {
  let email = req.params.email;

  let user = await userModel.find().where({email: email});
  let team = await teamModel.find().where({team: email});

  let message = {user: user, team:team, res:true}

  if (user.length > 0 && team.length > 0) {
    res.send({
      message: message,
    });
  } else {
    console.log("not admin");
  }
});
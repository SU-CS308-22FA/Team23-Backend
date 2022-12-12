const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
let auth = require("../controller/auth");
let bcrypt = require("bcryptjs");
const { Schema } = mongoose;
const { MongoClient, MongoGridFSChunkError, ObjectId } = require("mongodb");

const userModel = require("../models/user.model");
const teamModel = require("../models/team.model");
const catchAsync = require("./../utils/catchAsync");
const productModel = require("../models/product.model");
const bidModel = require("../models/bid.model");

const mailgun = require("mailgun-js");

exports.signup = catchAsync(async (req, res, next) => {
  var newUser = new userModel();
  newUser.name = req.body.name;
  newUser.lastname = req.body.lastname;
  newUser.email = req.body.email;
  newUser.type = "fan";
  // newUser.password = await bcrypt.hash(req.body.password, 12);
  newUser.password = req.body.password;
  newUser.products = [];
  newUser.status = true;
  newUser.purchased = [];
  newUser.bids = [];
  newUser._id = new ObjectId();

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
        const DOMAIN = "sandbox48645b44d8eb4529a6aed16a5240784b.mailgun.org";
        const APIKEY = "ad03f06d58ebea0a033d786965db53a8-2de3d545-a28c2796";
        const mg = mailgun({
          apiKey: APIKEY,
          domain: DOMAIN,
        });
        const data = {
          from: "Excited User <me@samples.mailgun.org>",
          to: newUser.email,
          subject: "MAÇTANA HOŞGELDİNİZ!",
          text: "MAÇTANA HOŞGELDİNİZ!\nHesabınız başarılı bir şekilde oluşturuldu.",
        };
        mg.messages().send(data, function (error, body) {
          console.log(body);
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
    console.log(password, users[0].password);
    let comparisonResult = password == users[0].password ? true : false;
    if (comparisonResult) {
      let token = auth.generateToken(users[0]);
      res.cookie("auth_token", token);
      res.send({
        redirectURL: "/",
        message: "correct email",
      });
    } else {
      console.log("wrong password");
    }
  } else {
    console.log("wrong email");
  }
});

exports.getUserInfo = catchAsync(async (req, res, next) => {
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

exports.getTeamData = catchAsync(async (req, res, next) => {
  let email = req.params.email;

  let user = await userModel.find().where({ email: email });
  let team = await teamModel.find().where({ team: email });

  let message = { user: user, team: team, res: true };

  if (user.length > 0 && team.length > 0) {
    res.send({
      message: message,
    });
  } else {
    console.log("not admin");
  }
});

exports.getTeamStatistics = catchAsync(async (req, res, next) => {
  const duration = 604800000;
  let data = req.params.data;
  let sum = 0;
  let soldItems = [];
  // console.log(data);
  let begin = data.substr(0, data.indexOf("+"));
  let end = data.substr(
    data.indexOf("+") + 1,
    data.indexOf("-") - data.indexOf("+") - 1
  );
  let email = data.substr(data.indexOf("-") + 1, data.length);
  // console.log(begin, ",", end, ",", email);

  let user = await userModel.find().where({ email: email });
  let pid = user[0].products;

  let products = await productModel.find().where({
    _id: { $in: pid },
    sold: true,
    start_date: { $gt: begin - duration, $lt: end - duration },
  });
  console.log(products);

  if (products.length >= 0) {
    for (let i = 0; i < products.length; i++) {
      sum = sum + products[i]["price"];
      soldItems.push(products[i]);
    }
    let message = { sum: sum, soldItems: soldItems };
    res.send({ message: message });
    console.log(message);
    // console.log(soldItems, "sum: ", sum);
  } else {
    res.send("not found");
  }
});

exports.getActiveBids = catchAsync(async (req, res, next) => {
  let email = req.params.email;
  let user = await userModel.find().where({ email: email });
  let bid_ids = user[0].bids;
  let uid = user[0]._id;
  let bids = await bidModel.find({ _id: { $in: bid_ids } });
  let activeBids = [];
  // console.log(bids);

  let pid = [];
  for (let i = 0; i < bids.length; i++) {
    pid.push(bids[i]["productId"]);
    // console.log(bids[i]["productId"]);
  }
  let uniquepids = [];
  pid.forEach((element) => {
    if (!uniquepids.includes(element)) {
      uniquepids.push(element);
    }
  });
  let products = await productModel.find({
    _id: { $in: uniquepids },
    open: true,
  });
  // console.log(products.length);

  let flag;
  for (let i = 0; i < products.length; i++) {
    activeBids.push(products[i].toObject());
    let highestBid = products[i]["bids"].slice(-1);
    // console.log(highestBid);
    let bidInfo = await bidModel.find({ _id: highestBid });
    // console.log(bidInfo);
    if (bidInfo[0].bidderId === uid) {
      flag = true;
      // console.log(bidInfo[0].bidderId, ", ", uid, "bbb");
      activeBids[i].state = flag;
    } else {
      flag = false;
      // console.log(bidInfo[0].bidderId, ", ", uid, "aaa");
      activeBids[i].state = flag;
    }
  }
  // console.log(activeBids);
  activeBids = activeBids.sort((a, b) => Number(b.state) - Number(a.state));
  console.log(activeBids);

  // for (let i = 0; i < products.length; i++) {
  //   let len = products[i]["bids"].length;
  //   let bids = await bidModel.find({
  //     _id: { $in: products[i]["bids"] },
  //   });
  //   console.log(bids, products[i].bids);
  // }

  if (activeBids.length === 0) {
    activeBids = [{}];
  }

  res.send({
    message: activeBids,
  });
});

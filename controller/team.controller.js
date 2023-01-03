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

exports.getLogos = catchAsync(async (req, res, next) => {
  let logos = [];
  let teams = await teamModel.find().where();

  teams.forEach((team) => {
    logos.push(team.logo);
  });

  if (logos.length > 0) {
    res.send({
      message: teams,
    });
  } else {
    console.log("Error get logos");
  }
});

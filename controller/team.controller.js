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

exports.getSalesStatistics = catchAsync(async (req, res, next) => {
  try {
    console.log("AY OHH BEEEE!!!");

    // Step 1: Retrieve the user's email.
    let { email } = req.params;

    // Step 2: Find the "displayName" of the team with that email.
    let user = await userModel.findOne({ email });
    let team = await teamModel.findOne({ team: user.email });

    displayName = email.substring(0, email.indexOf("@"));
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    console.log(team, displayName);
    // Step 3: Find each product that has an "owner" field equal to the display name and a "sold" field equal to true.
    let products = await productModel.find({
      owner: displayName,
      sold: true,
    });

    // Step 4: Group the products by name and add up their prices.
    let data = {};
    products.forEach((product) => {
      let name = product.name;
      if (!data[name]) {
        data[name] = 0;
      }
      data[name] += product.price;
    });

    // Step 5: Send the chart data as a JSON object in the response.
    let chartData = Object.entries(data).map(([name, totalPrice]) => ({
      name,
      totalPrice,
    }));

    res.json({ data: chartData });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

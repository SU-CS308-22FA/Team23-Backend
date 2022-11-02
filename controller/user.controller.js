const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
const { Schema } = mongoose;

const { MongoClient, MongoGridFSChunkError } = require("mongodb");
const userModel = require("../models/user.model");
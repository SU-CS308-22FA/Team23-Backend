let mongoose = require("mongoose");
const { Schema } = mongoose;
let validator = require("validator");

const userSchema = new Schema({
  _id: String,
  type: String,
  name: String,
  lastname: String,
  age: Number,
  team: String,
  email: String,
  // {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   lowercase: true,
  //   validate: (value) => {
  //     return validator.isEmail(value);
  //   },
  // },
  password: String,
  status: Boolean,
  products: [String],
  purchased: [String],
  bids: [String],
});

module.exports = mongoose.model("User", userSchema);

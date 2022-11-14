let mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  //auction id
  type: String,
  name: String,
  owner: String,
  sold: Boolean,
});

module.exports = mongoose.model("Product", productSchema);

("test");

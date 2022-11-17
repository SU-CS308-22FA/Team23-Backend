let mongoose = require("mongoose");
const { Schema } = mongoose;

// const ImageSchema = new Schema({
//   url: String,
//   filename: String,
// });

const productSchema = new Schema({
  //auction id
  type: String,
  name: String,
  owner: String,
  image: String,
  cloudinary_id: String,
  _id: String,
  sold: Boolean,
  start_date: Number,
  duration: Number,
  price: Number,
});

module.exports = mongoose.model("Product", productSchema);

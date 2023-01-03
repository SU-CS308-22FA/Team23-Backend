let mongoose = require("mongoose");
const { Schema } = mongoose;

// const ImageSchema = new Schema({
//   url: String,
//   filename: String,
// });

const productSchema = new Schema({
  _id: String,
  type: String,
  name: String,
  owner: String,
  image: String,
  cloudinary_id: String,
  sold: Boolean,
  open: Boolean,
  start_date: Number,
  duration: Number,
  price: Number,
  basePrice: Number,
  paid: Boolean,
  bids: [String],
});
productSchema.index({ name: "text", type: "text", owner: "text" });
module.exports = mongoose.model("Product", productSchema);

let mongoose = require("mongoose");
const { Schema } = mongoose;

const auctionSchema = new Schema({
  _id: String,
  product_id: String,
  bids: [Number],
  duration: Number,
  start_date: Number,
  finish_date: Number,
  base_price: Number,
  open: Boolean,
});

module.exports = mongoose.model("Auction", auctionSchema);

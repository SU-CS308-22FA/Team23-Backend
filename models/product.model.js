let mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  //auction id
  type: String,
  name: String,
  owner: String,
  sold: Boolean,
  img: {
    name: String,
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("Product", productSchema);

("test");

let mongoose = require("mongoose");
const { Schema } = mongoose;

const teamSchema = new Schema({
  team: String,
  logo: String,
  name: String,
  displayName: String,
});

module.exports = mongoose.model("Team", teamSchema);

const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  placeName: String,
  coordinates: String,
  imageUrl: String,
  description: String,
  region: String,
  tripType: String,
  budget: Number,
  attractions: [String],
});

module.exports = mongoose.model("Place", placeSchema);

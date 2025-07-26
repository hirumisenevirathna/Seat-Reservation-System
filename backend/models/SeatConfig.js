const mongoose = require("mongoose");

const seatConfigSchema = new mongoose.Schema({
  totalSeats: { type: Number, required: true, default: 40 },
  disabledSeats: [{ type: String }], // List of seat numbers that are disabled
});

module.exports = mongoose.model("SeatConfig", seatConfigSchema);
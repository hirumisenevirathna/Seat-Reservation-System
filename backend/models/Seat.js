const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: String,
  date: String, 
  email: String, 
});

module.exports = mongoose.model('Seat', SeatSchema);

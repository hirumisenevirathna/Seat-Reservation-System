const express = require("express");
const router = express.Router();
const Reservation = require("../models/Seat"); // Assuming Seat is the model; rename to Reservation if different

// Get reservations by email
router.get("/:email", async (req, res) => {
  try {
    const reservations = await Reservation.find({ email: req.params.email });
    console.log("Found reservations:", reservations);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete reservation
router.delete("/:id", async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reservation" });
  }
});

// Update reservation (enhanced to validate update)
router.put("/:id", async (req, res) => {
  try {
    console.log("Updating reservation:", req.params.id);
    const { seatNumber, date } = req.body;
    if (!seatNumber || !date) {
      return res.status(400).json({ message: "Seat number and date are required" });
    }
    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      { seatNumber, date },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
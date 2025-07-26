const express = require("express");
const router = express.Router();
const Seat = require("../models/Seat");
const User = require("../models/User");
const SeatConfig = require("../models/SeatConfig");

// GET seat configuration (available, reserved, and disabled seats)
router.get("/", async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    const config = await SeatConfig.findOne();
    const totalSeats = config ? config.totalSeats : 40;
    const disabledSeats = config ? config.disabledSeats : [];

    const allSeats = Array.from({ length: totalSeats }, (_, i) => (i + 1).toString());
    const reserved = await Seat.find({ date }).select("seatNumber -_id");
    const reservedSeats = reserved.map((s) => s.seatNumber);
    const availableSeats = allSeats.filter((s) => !reservedSeats.includes(s) && !disabledSeats.includes(s));

    res.json({ availableSeats, reservedSeats, disabledSeats, totalSeats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET detailed reservation info for admin
router.get("/reserved-details", async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    const reservedSeats = await Seat.find({ date }).select("seatNumber email _id");
    const reservedDetails = await Promise.all(
      reservedSeats.map(async (seat) => {
        const user = await User.findOne({ email: seat.email }).select("fullName -_id");
        return {
          seatNumber: seat.seatNumber,
          fullName: user ? user.fullName : "Unknown",
          email: seat.email,
          _id: seat._id,
        };
      })
    );
    res.json({ reservedDetails });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET single reservation by seatNumber and date
router.get("/reservation", async (req, res) => {
  const { seatNumber, date } = req.query;

  if (!seatNumber || !date) {
    return res.status(400).json({ error: "Seat number and date are required" });
  }

  try {
    const reservation = await Seat.findOne({ seatNumber, date }).select("seatNumber email _id");
    if (!reservation) {
      return res.status(404).json({ error: "No reservation found for this seat and date" });
    }
    const user = await User.findOne({ email: reservation.email }).select("fullName -_id");
    res.json({
      seatNumber: reservation.seatNumber,
      email: reservation.email,
      fullName: user ? user.fullName : "Unknown",
      _id: reservation._id,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST reserve seat (add)
router.post("/reserve", async (req, res) => {
  const { seatNumber, date, email } = req.body;

  if (!seatNumber || !date || !email) {
    return res.status(400).json({ error: "Seat number, date, and email are required" });
  }

  try {
    const config = await SeatConfig.findOne();
    const disabledSeats = config ? config.disabledSeats : [];
    if (disabledSeats.includes(seatNumber)) {
      return res.status(403).json({ error: "This seat is disabled and cannot be reserved" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const existing = await Seat.findOne({ seatNumber, date });
    if (existing) {
      return res.status(409).json({ error: "Seat already reserved" });
    }
    const seat = new Seat({ seatNumber, date, email });
    await seat.save();

    res.json({ success: true, message: "Seat reserved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Reservation failed" });
  }
});

// PUT update or create seat reservation
router.put("/reserve/:id", async (req, res) => {
  const { seatNumber, date, email } = req.body;
  const { id } = req.params;

  if (!seatNumber || !date || !email) {
    return res.status(400).json({ error: "Seat number, date, and email are required" });
  }

  try {
    const config = await SeatConfig.findOne();
    const disabledSeats = config ? config.disabledSeats : [];
    if (disabledSeats.includes(seatNumber)) {
      return res.status(403).json({ error: "This seat is disabled and cannot be reserved" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const existing = await Seat.findOne({ seatNumber, date, _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({ error: "Seat already reserved for this date" });
    }
    let seat = await Seat.findById(id);
    if (seat) {
      // Update existing reservation
      seat = await Seat.findByIdAndUpdate(
        id,
        { seatNumber, date, email },
        { new: true }
      );
      res.json({ success: true, message: "Seat reservation updated successfully" });
    } else {
      // Create new reservation if ID not found
      const newSeat = new Seat({ seatNumber, date, email });
      await newSeat.save();
      res.json({ success: true, message: "Seat reservation created successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE seat reservation
router.delete("/reserve/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const seat = await Seat.findByIdAndDelete(id);
    if (!seat) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    res.json({ success: true, message: "Seat reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

// POST disable a seat (stop reservation ability)
router.post("/disable", async (req, res) => {
  const { seatNumber } = req.body;

  if (!seatNumber) {
    return res.status(400).json({ error: "Seat number is required" });
  }

  try {
    let config = await SeatConfig.findOne();
    if (!config) {
      config = new SeatConfig({ totalSeats: 40, disabledSeats: [] });
    }
    if (config.disabledSeats.includes(seatNumber)) {
      return res.status(409).json({ error: "Seat is already disabled" });
    }
    if (parseInt(seatNumber) > config.totalSeats) {
      return res.status(400).json({ error: "Seat number exceeds total seats" });
    }
    config.disabledSeats.push(seatNumber);
    await config.save();
    res.json({ success: true, message: `Seat ${seatNumber} disabled successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to disable seat" });
  }
});

// POST release a disabled seat (make it available again)
router.post("/release", async (req, res) => {
  const { seatNumber } = req.body;

  if (!seatNumber) {
    return res.status(400).json({ error: "Seat number is required" });
  }

  try {
    const config = await SeatConfig.findOne();
    if (!config || !config.disabledSeats.includes(seatNumber)) {
      return res.status(404).json({ error: "Seat is not disabled" });
    }
    config.disabledSeats = config.disabledSeats.filter((s) => s !== seatNumber);
    await config.save();
    res.json({ success: true, message: `Seat ${seatNumber} released successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to release seat" });
  }
});

// POST add a new seat (increase total seats)
router.post("/add-seat", async (req, res) => {
  try {
    let config = await SeatConfig.findOne();
    if (!config) {
      config = new SeatConfig({ totalSeats: 40, disabledSeats: [] });
    }
    config.totalSeats += 1;
    await config.save();
    res.json({ success: true, message: `New seat ${config.totalSeats} added successfully`, newSeatNumber: config.totalSeats });
  } catch (err) {
    res.status(500).json({ error: "Failed to add new seat" });
  }
});

// GET seat usage report for a date range
router.get("/usage-report", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required" });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    if (start > end) {
      return res.status(400).json({ error: "Start date must be before or equal to end date" });
    }

    const config = await SeatConfig.findOne();
    const totalSeats = config ? config.totalSeats : 40;
    const disabledSeats = config ? config.disabledSeats : [];

    // Fetch reservations within the date range
    const reservations = await Seat.find({
      date: { $gte: start.toISOString().split("T")[0], $lte: end.toISOString().split("T")[0] },
    }).select("seatNumber email date");

    // Group reservations by date
    const reservationsByDate = {};
    for (const reservation of reservations) {
      const date = reservation.date;
      if (!reservationsByDate[date]) {
        reservationsByDate[date] = [];
      }
      reservationsByDate[date].push(reservation);
    }

    // Calculate daily stats and fetch user details
    const report = await Promise.all(
      Object.keys(reservationsByDate).map(async (date) => {
        const reservedSeats = reservationsByDate[date].map((r) => r.seatNumber);
        const availableSeats = Array.from({ length: totalSeats }, (_, i) => (i + 1).toString()).filter(
          (s) => !reservedSeats.includes(s) && !disabledSeats.includes(s)
        );
        const reservationDetails = await Promise.all(
          reservationsByDate[date].map(async (reservation) => {
            const user = await User.findOne({ email: reservation.email }).select("fullName -_id");
            return {
              seatNumber: reservation.seatNumber,
              email: reservation.email,
              fullName: user ? user.fullName : "Unknown",
              date: reservation.date,
            };
          })
        );
        return {
          date,
          totalSeats,
          availableSeats: availableSeats.length,
          reservedSeats: reservedSeats.length,
          disabledSeats: disabledSeats.length,
          reservationDetails,
        };
      })
    );

    // Summary for the entire date range
    const allReservedSeats = [...new Set(reservations.map((r) => r.seatNumber))];
    const summary = {
      totalSeats,
      totalAvailableSeats: Array.from({ length: totalSeats }, (_, i) => (i + 1).toString()).filter(
        (s) => !allReservedSeats.includes(s) && !disabledSeats.includes(s)
      ).length,
      totalReservedSeats: allReservedSeats.length,
      totalDisabledSeats: disabledSeats.length,
      totalReservations: reservations.length,
    };

    res.json({ summary, dailyReports: report });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate seat usage report" });
  }
});

module.exports = router;
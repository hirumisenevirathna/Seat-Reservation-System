const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const seatRoutes = require('./routes/seatRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));


app.use(express.json());

// Register routes BEFORE starting server
app.use('/api', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/reservations', reservationRoutes); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));

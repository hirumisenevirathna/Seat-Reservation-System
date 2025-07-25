"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const Seat = ({ number, isAvailable, isReserved, isUserReserved, isUpdating, onClick }) => {
  let seatClass = "bg-gray-300";
  if (isUpdating) seatClass = "bg-purple-600 text-white animate-pulse"; // Highlight reserved seat for update
  else if (isUserReserved) seatClass = "bg-purple-600 text-white animate-pulse";
  else if (isReserved) seatClass = "bg-red-500 text-white";
  else if (isAvailable) seatClass = "bg-green-500 text-white";

  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center m-1 cursor-pointer shadow-md transition-all duration-300 
        ${seatClass} hover:scale-110 hover:bg-blue-500 hover:text-white`}
      onClick={onClick}
    >
      {number}
    </div>
  );
};

export default function ViewSeatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reservationId = searchParams.get("reservationId");
  const initialDate = searchParams.get("date") || "";
  const initialSeatNumber = searchParams.get("seatNumber") || "";
  const [date, setDate] = useState(initialDate);
  const [seats, setSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [userReservedSeats, setUserReservedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingSeatNumber, setUpdatingSeatNumber] = useState(initialSeatNumber);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

  useEffect(() => {
    if (date) fetchSeatsForDate(date);
  }, [date]);

  const fetchSeatsForDate = async (fetchDate) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/seats?date=${fetchDate}&email=${user?.email}`
      );
      setSeats(res.data.availableSeats || []);
      setReservedSeats(res.data.reservedSeats || []);
      setUserReservedSeats(res.data.userReservedSeats || []);
    } catch (err) {
      alert("Error fetching seats");
      setSeats([]);
      setReservedSeats([]);
      setUserReservedSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      alert("Please select today or a future date.");
      return;
    }
    fetchSeatsForDate(date);
  };

  const handleSeatClick = async (seatNumber, isAvailable) => {
  if (!date) {
    alert("Please select a date first!");
    return;
  }

  if (!isAvailable || reservedSeats.includes(seatNumber)) return;

  const email = user?.email || "";

  if (reservationId) {
    const confirmed = window.confirm(
      `Do you want to update your reservation to seat ${seatNumber}?`
    );
    if (!confirmed) return;

    try {
      await axios.put(`http://localhost:5000/api/reservations/${reservationId}`, {
        seatNumber,
        date,
        email,
      });
      setUpdatingSeatNumber(seatNumber);
      alert("Reservation updated successfully");
      fetchSeatsForDate(date);
    } catch (err) {
      alert("Failed to update reservation");
    }
  } else {


  
    const confirmed = window.confirm(
      `Do you want to reserve seat ${seatNumber}?`
    );
    if (!confirmed) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/seats/reserve`, {
        seatNumber,
        date,
        email,
      });
      alert(res.data.message || "Seat reserved successfully");
      fetchSeatsForDate(date);
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Reservation failed");
      }
    }
  }
};


  const renderSeatRow = (start) => (
    <div className="flex justify-center mb-2">
      {[...Array(10)].map((_, i) => {
        const seatNumber = (start + i).toString();
        const isAvailable = seats.includes(seatNumber);
        const isReserved = reservedSeats.includes(seatNumber);
        const isUserReserved = userReservedSeats.includes(seatNumber);
        const isUpdating = seatNumber === updatingSeatNumber; // Highlight the updating seat
        return (
          <Seat
            key={seatNumber}
            number={seatNumber}
            isAvailable={isAvailable}
            isReserved={isReserved}
            isUserReserved={isUserReserved}
            isUpdating={isUpdating}
            onClick={() => handleSeatClick(seatNumber, isAvailable)}
          />
        );
      })}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6 flex items-center justify-center"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Only this white blur box applies opacity, rest of background remains clear */}
      <div className="relative w-full max-w-5xl rounded-xl shadow-xl p-8">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl z-0"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">🎟️ Seat Reservation System</h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-center gap-4 mb-8 justify-center"
          >
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 shadow-lg transition-all"
            >
              {loading ? "Loading..." : "Check Availability"}
            </button>
          </form>

          <div className="rounded-lg p-4 mb-6">
            {renderSeatRow(1)}
            <div className="my-3 h-6 bg-gray-400 rounded-lg w-full max-w-3xl mx-auto shadow-inner" />
            {renderSeatRow(11)}
            {renderSeatRow(21)}
            <div className="my-3 h-6 bg-gray-400 rounded-lg w-full max-w-3xl mx-auto shadow-inner" />
            {renderSeatRow(31)}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/NavApp/MyReservations")}
              className="bg-blue-600 text-white py-2 px-8 rounded hover:bg-blue-700 shadow-md transition-all"
            >
              📋 View My Reservations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


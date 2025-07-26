"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaBan, FaUnlock, FaChair } from "react-icons/fa";

const Seat = ({ number, isAvailable, isReserved, isDisabled, fullName, onClick }) => {
  let seatClass = "bg-gray-300";
  let statusText = "";
  if (isDisabled) {
    seatClass = "bg-gray-500 text-white line-through";
    statusText = "Disabled (Not Reservable)";
  } else if (isReserved) {
    seatClass = "bg-red-500 text-white";
    statusText = fullName ? `Reserved by: ${fullName}` : "Reserved";
  } else if (isAvailable) {
    seatClass = "bg-green-500 text-white";
    statusText = "Available";
  }

  return (
    <div
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center m-1 sm:m-2 shadow-lg transition-all duration-300 transform hover:scale-105 ${seatClass} cursor-pointer relative group`}
      title={statusText}
      onClick={onClick}
    >
      <span className="text-base sm:text-lg font-semibold">{number}</span>
      {isReserved && fullName && !isDisabled && (
        <span className="text-xs truncate w-10 sm:w-12">{fullName}</span>
      )}
      <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {statusText}
      </div>
    </div>
  );
};

export default function AdminSeatsPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [disabledSeats, setDisabledSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(40);
  const [reservedDetails, setReservedDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("delete"); // 'delete', 'release', 'add-seat'
  const [selectedSeat, setSelectedSeat] = useState("");

  useEffect(() => {
    if (date) fetchSeatsForDate(date);
  }, [date]);

  const fetchSeatsForDate = async (fetchDate) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/seats?date=${fetchDate}`);
      setSeats(res.data.availableSeats || []);
      setReservedSeats(res.data.reservedSeats || []);
      setDisabledSeats(res.data.disabledSeats || []);
      setTotalSeats(res.data.totalSeats || 40);
      
      const reservedRes = await axios.get(`http://localhost:5000/api/seats/reserved-details?date=${fetchDate}`);
      setReservedDetails(reservedRes.data.reservedDetails || []);
    } catch (err) {
      console.error("Error fetching seats:", err);
      alert("Failed to load seat data. Please check if the server is running.");
      setSeats([]);
      setReservedSeats([]);
      setDisabledSeats([]);
      setTotalSeats(40);
      setReservedDetails([]);
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

  const handleSeatClick = async (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!date && action !== "add-seat") {
      alert("Please select a date");
      return;
    }
    if (["delete", "release"].includes(action) && !selectedSeat) {
      alert("Please select a seat");
      return;
    }

    try {
      if (action === "delete") {
        const confirmed = window.confirm(`Are you sure you want to delete seat ${selectedSeat}? This will make it unreservable.`);
        if (!confirmed) return;
        const res = await axios.post(`http://localhost:5000/api/seats/disable`, {
          seatNumber: selectedSeat,
        });
        alert(res.data.message || `Seat ${selectedSeat} deleted (disabled) successfully`);
      } else if (action === "release") {
        const confirmed = window.confirm(`Are you sure you want to release seat ${selectedSeat}? This will make it reservable again.`);
        if (!confirmed) return;
        const res = await axios.post(`http://localhost:5000/api/seats/release`, {
          seatNumber: selectedSeat,
        });
        alert(res.data.message || `Seat ${selectedSeat} released successfully`);
      } else if (action === "add-seat") {
        const confirmed = window.confirm(`Are you sure you want to add a new seat (seat ${totalSeats + 1})?`);
        if (!confirmed) return;
        const res = await axios.post(`http://localhost:5000/api/seats/add-seat`);
        alert(res.data.message || `New seat ${res.data.newSeatNumber} added successfully`);
      }
      if (date) fetchSeatsForDate(date);
      setSelectedSeat("");
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      let errorMessage = "Action failed. Please check inputs and server status.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.request) {
        errorMessage = "No response from server. Please ensure the server is running.";
      }
      alert(errorMessage);
    }
  };

  const renderSeatRow = (start, end) => (
    <div key={`row-${start}`} className="flex flex-wrap justify-center mb-2 sm:mb-4">
      {[...Array(Math.min(5, end - start + 1))].map((_, i) => {
        const seatNumber = (start + i).toString();
        const isAvailable = seats.includes(seatNumber);
        const isReserved = reservedSeats.includes(seatNumber);
        const isDisabled = disabledSeats.includes(seatNumber);
        const reservation = reservedDetails.find((r) => r.seatNumber === seatNumber);
        return (
          <Seat
            key={seatNumber}
            number={seatNumber}
            isAvailable={isAvailable}
            isReserved={isReserved}
            isDisabled={isDisabled}
            fullName={reservation?.fullName}
            onClick={() => handleSeatClick(seatNumber)}
          />
        );
      })}
    </div>
  );

  const renderSeatGrid = () => {
    const rows = [];
    for (let start = 1; start <= totalSeats; start += 5) {
      rows.push(renderSeatRow(start, Math.min(start + 4, totalSeats)));
      if (start + 5 <= totalSeats) {
        rows.push(
          <div
            key={`divider-${start}`}
            className="my-2 sm:my-4 h-1 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full w-full max-w-3xl mx-auto"
          />
        );
      }
    }
    return rows;
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed p-2 sm:p-4 md:p-8 flex items-center justify-center font-poppins"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="relative w-full max-w-full sm:max-w-5xl md:max-w-6xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold mb-4 sm:mb-6 md:mb-8 text-center text-white drop-shadow-lg">
          🎟️ Seat Management
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-10 justify-center"
        >
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 sm:px-3 md:px-4(py-1 sm:py-2 md:py-3 bg-white/80 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full max-w-xs sm:w-48"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-1 sm:py-2 md:py-3 px-4 sm:px-6 md:px-8 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 w-full max-w-xs sm:w-auto"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <FaChair /> View Seats
              </>
            )}
          </button>
        </form>

        <div className="mb-4 sm:mb-6 md:mb-10 bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 md:mb-6 text-center text-white drop-shadow-md">Manage Seats</h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
            {[
              { action: "delete", label: "Delete Seat", icon: <FaBan /> },
              { action: "release", label: "Release Seat", icon: <FaUnlock /> },
              { action: "add-seat", label: "Add New Seat", icon: <FaChair /> },
            ].map(({ action: btnAction, label, icon }) => (
              <button
                key={btnAction}
                onClick={() => setAction(btnAction)}
                className={`py-1 sm:py-2 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${
                  action === btnAction
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <form onSubmit={handleActionSubmit} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 justify-center">
            <select
              value={selectedSeat}
              onChange={(e) => setSelectedSeat(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 bg-white/80 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full max-w-xs sm:w-48"
              disabled={action === "add-seat"}
            >
              <option value="">Select Seat</option>
              {Array.from({ length: totalSeats }, (_, i) => (i + 1).toString()).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-1 sm:py-2 md:py-3 px-4 sm:px-6 md:px-8 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 w-full max-w-xs sm:w-auto"
            >
              {action === "delete" ? (
                <>
                  <FaBan /> Delete Seat
                </>
              ) : action === "release" ? (
                <>
                  <FaUnlock /> Release Seat
                </>
              ) : (
                <>
                  <FaChair /> Add New Seat
                </>
              )}
            </button>
          </form>
        </div>

        <div className="rounded-xl p-4 sm:p-6 bg-white/10 backdrop-blur-md border border-white/20 mb-4 sm:mb-6 md:mb-10">
          {renderSeatGrid()}
        </div>

        <div className="text-center flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
          <button
            onClick={() => router.push("/ManageReservationsPage")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1 sm:py-2 md:py-3 px-4 sm:px-6 md:px-10 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 w-full max-w-xs sm:w-auto"
          >
            <FaChair /> Manage Reservations
          </button>
          <button
            onClick={() => router.push("/ViewDetailPage")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1 sm:py-2 md:py-3 px-4 sm:px-6 md:px-10 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 w-full max-w-xs sm:w-auto"
          >
            <FaChair /> View Reservation Details
          </button>
        </div>
      </div>
    </div>
  );
}
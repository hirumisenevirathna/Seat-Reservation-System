"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaSearch, FaArrowLeft } from "react-icons/fa";

export default function ViewDetailPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reservedDetails, setReservedDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date) fetchReservationDetails(date);
  }, [date]);

  const fetchReservationDetails = async (fetchDate) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/seats/reserved-details?date=${fetchDate}`);
      setReservedDetails(res.data.reservedDetails || []);
    } catch (err) {
      console.error("Error fetching reservation details:", err);
      let errorMessage = "Failed to load reservation details. Please check if the server is running.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.request) {
        errorMessage = "No response from server. Please ensure the server is running.";
      }
      alert(errorMessage);
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
    fetchReservationDetails(date);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed p-4 sm:p-6 md:p-8 flex items-center justify-center font-poppins"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-white drop-shadow-lg">
          🎟️ Reservation Details
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-10 justify-center"
        >
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white/80 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full sm:w-40 md:w-48"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <FaSearch /> View Details
              </>
            )}
          </button>
        </form>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 mb-6 sm:mb-10">
          {reservedDetails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="border border-white/20 p-2 sm:p-3 rounded-tl-lg text-sm sm:text-base">Seat Number</th>
                    <th className="border border-white/20 p-2 sm:p-3 rounded-tr-lg text-sm sm:text-base">Intern Name</th>
                  </tr>
                </thead>
                <tbody>
                  {reservedDetails.map((reservation) => (
                    <tr
                      key={reservation.seatNumber}
                      className="even:bg-white/20 odd:bg-white/10 hover:bg-white/30 transition-all duration-200"
                    >
                      <td className="border border-white/20 p-2 sm:p-3 text-white text-sm sm:text-base text-center">{reservation.seatNumber}</td>
                      <td className="border border-white/20 p-2 sm:p-3 text-white text-sm sm:text-base text-center">{reservation.fullName || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-white text-base sm:text-lg">No reservations for this date.</p>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push("/AdminSeatsPage")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 px-6 sm:px-10 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 mx-auto w-full sm:w-auto"
          >
            <FaArrowLeft /> Back to Seat Management
          </button>
        </div>
      </div>
    </div>
  );
}
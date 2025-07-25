"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { isAuthenticated, getCurrentUser } from "../../../utils/auth";
import { useRouter } from "next/navigation";

const MyReservations = () => {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [reservations, setReservations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ seatNumber: "", date: "" });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/home");
    } else {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reservations/${user.email}`);
      setReservations(res.data);
    } catch (err) {
      console.error("Failed to load reservations:", err);
    }
  };

  useEffect(() => {
    if (user) fetchReservations();
  }, [user]);

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to cancel this reservation?")) {
      await axios.delete(`http://localhost:5000/api/reservations/${id}`);
      fetchReservations();
    }
  };

  const handleUpdate = async (id) => {
    await axios.put(`http://localhost:5000/api/reservations/${id}`, editData);
    setEditingId(null);
    fetchReservations();
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Overlayed box */}
      <div className="relative w-full max-w-4xl rounded-xl shadow-xl p-8">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl z-0"></div>

        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-600 tracking-wide">
            My Reservations
          </h2>

          {reservations.length === 0 ? (
            <p className="text-center text-gray-600 text-lg italic">No reservations found.</p>
          ) : (
            reservations.map((res) => {
              const isFuture = new Date(res.date) >= new Date();

              return (
                <div
                  key={res._id}
                  className={`mb-6 p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.02] ${
                    isFuture ? "bg-indigo-50" : "bg-gray-100"
                  }`}
                >
                  {editingId === res._id ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                      <input
                        type="text"
                        placeholder="Seat Number"
                        value={editData.seatNumber}
                        onChange={(e) =>
                          setEditData({ ...editData, seatNumber: e.target.value })
                        }
                        className="mb-3 sm:mb-0 p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                      />
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) =>
                          setEditData({ ...editData, date: e.target.value })
                        }
                        className="mb-3 sm:mb-0 p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                      />
                      <button
                        onClick={() => handleUpdate(res._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg shadow-md transition mt-3 sm:mt-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-lg font-semibold text-indigo-700">
                          Seat: <span className="font-normal text-gray-800">{res.seatNumber}</span>
                        </p>
                        <p className="text-lg font-semibold text-indigo-700">
                          Date: <span className="font-normal text-gray-800">{res.date}</span>
                        </p>
                        <p
                          className={`mt-1 font-semibold ${
                            isFuture ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          Status: {isFuture ? "Upcoming" : "Past"}
                        </p>
                      </div>

                      {isFuture && (
                        <div className="space-x-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCancel(res._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/NavApp/view-seats?reservationId=${res._id}&date=${res.date}&seatNumber=${res.seatNumber}`
                              )
                            }
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg shadow-md transition"
                          >
                            Update via View Seats
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReservations;
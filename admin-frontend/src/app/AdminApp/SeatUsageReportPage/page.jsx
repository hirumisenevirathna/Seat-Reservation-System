"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaChartBar, FaChair } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SeatUsageReportPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (start > end) {
      alert("Start date must be before or equal to end date.");
      return;
    }
    if (start < today) {
      alert("Start date must be today or a future date.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/seats/usage-report`, {
        params: { startDate, endDate },
      });
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching seat usage report:", err);
      let errorMessage = "Failed to generate report. Please check if the server is running.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.request) {
        errorMessage = "No response from server. Please ensure the server is running.";
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    let yOffset = 10;

    // Title
    doc.setFontSize(16);
    doc.text(`Seat Usage Report (${startDate} to ${endDate})`, 10, yOffset);
    yOffset += 10;

    // Summary Table
    doc.setFontSize(12);
    doc.text("Summary", 10, yOffset);
    yOffset += 5;
    autoTable(doc, {
      startY: yOffset,
      head: [["Total Seats", "Available Seats", "Reserved Seats", "Disabled Seats", "Total Reservations"]],
      body: [[
        report.summary.totalSeats,
        report.summary.totalAvailableSeats,
        report.summary.totalReservedSeats,
        report.summary.totalDisabledSeats,
        report.summary.totalReservations,
      ]],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
    });
    yOffset = doc.lastAutoTable.finalY + 10;

    // Daily Breakdown
    report.dailyReports.forEach((day) => {
      doc.setFontSize(12);
      doc.text(`Date: ${day.date}`, 10, yOffset);
      yOffset += 5;

      // Daily Metrics Table
      autoTable(doc, {
        startY: yOffset,
        head: [["Total Seats", "Available Seats", "Reserved Seats", "Disabled Seats"]],
        body: [[day.totalSeats, day.availableSeats, day.reservedSeats, day.disabledSeats]],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0] },
      });
      yOffset = doc.lastAutoTable.finalY + 5;

      // Reservations Table
      doc.setFontSize(12);
      doc.text("Reservations", 10, yOffset);
      yOffset += 5;
      if (day.reservationDetails.length === 0) {
        doc.setFontSize(10);
        doc.text("No reservations for this date.", 10, yOffset);
        yOffset += 10;
      } else {
        autoTable(doc, {
          startY: yOffset,
          head: [["Seat Number", "Full Name", "Email"]],
          body: day.reservationDetails.map((res) => [
            res.seatNumber,
            res.fullName,
            res.email,
          ]),
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
          bodyStyles: { textColor: [0, 0, 0] },
        });
        yOffset = doc.lastAutoTable.finalY + 10;
      }
    });

    // Save PDF
    doc.save(`seat_usage_report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed p-4 sm:p-6 md:p-8 flex items-center justify-center font-poppins"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-white drop-shadow-lg">
          📊 Seat Usage Report
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-10 justify-center"
        >
          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white/80 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full sm:w-40 md:w-48"
            required
          />
          <input
            type="date"
            value={endDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
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
                <FaChartBar /> Generate Report
              </>
            )}
          </button>
        </form>

        {report && (
          <div className="mb-6 sm:mb-10 bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center text-white drop-shadow-md">
              Seat Usage Report ({startDate} to {endDate})
            </h2>
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-white border-collapse">
                  <thead>
                    <tr className="bg-white/20">
                      <th className="p-2 sm:p-3 text-sm sm:text-base">Total Seats</th>
                      <th className="p-2 sm:p-3 text-sm sm:text-base">Available Seats</th>
                      <th className="p-2 sm:p-3 text-sm sm:text-base">Reserved Seats</th>
                      <th className="p-2 sm:p-3 text-sm sm:text-base">Disabled Seats</th>
                      <th className="p-2 sm:p-3 text-sm sm:text-base">Total Reservations</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10 hover:bg-white/10">
                      <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{report.summary.totalSeats}</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{report.summary.totalAvailableSeats}</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{report.summary.totalReservedSeats}</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{report.summary.totalDisabledSeats}</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{report.summary.totalReservations}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Daily Breakdown</h3>
              {report.dailyReports.length === 0 ? (
                <p className="text-white text-center text-base sm:text-lg">No reservations found for the selected date range.</p>
              ) : (
                report.dailyReports.map((day) => (
                  <div key={day.date} className="mb-4 sm:mb-6">
                    <h4 className="text-base sm:text-lg font-medium text-white mb-2">Date: {day.date}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-white border-collapse">
                        <thead>
                          <tr className="bg-white/20">
                            <th className="p-2 sm:p-3 text-sm sm:text-base">Total Seats</th>
                            <th className="p-2 sm:p-3 text-sm sm:text-base">Available Seats</th>
                            <th className="p-2 sm:p-3 text-sm sm:text-base">Reserved Seats</th>
                            <th className="p-2 sm:p-3 text-sm sm:text-base">Disabled Seats</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/10 hover:bg-white/10">
                            <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{day.totalSeats}</td>
                            <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{day.availableSeats}</td>
                            <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{day.reservedSeats}</td>
                            <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{day.disabledSeats}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <h5 className="text-sm sm:text-md font-medium text-white mt-3 sm:mt-4 mb-2">Reservations</h5>
                    {day.reservationDetails.length === 0 ? (
                      <p className="text-white text-base sm:text-lg">No reservations for this date.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-white border-collapse">
                          <thead>
                            <tr className="bg-white/20">
                              <th className="p-2 sm:p-3 text-sm sm:text-base">Seat Number</th>
                              <th className="p-2 sm:p-3 text-sm sm:text-base">Full Name</th>
                              <th className="p-2 sm:p-3 text-sm sm:text-base">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.reservationDetails.map((res, index) => (
                              <tr key={index} className="border-b border-white/10 hover:bg-white/10">
                                <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{res.seatNumber}</td>
                                <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{res.fullName}</td>
                                <td className="p-2 sm:p-3 text-sm sm:text-base text-center">{res.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="text-center mt-4 sm:mt-6">
              <button
                onClick={downloadPDF}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 mx-auto w-full sm:w-auto"
              >
                <FaChartBar /> Download PDF
              </button>
            </div>
          </div>
        )}

        <div className="text-center flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => router.push("/ManageReservationsPage")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 px-6 sm:px-10 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
          >
            <FaChair /> Manage Reservations
          </button>
          <button
            onClick={() => router.push("/AdminSeatsPage")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 px-6 sm:px-10 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
          >
            <FaChair /> Seat Management
          </button>
          <button
            onClick={() => router.push("/ViewDetailPage")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 px-6 sm:px-10 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
          >
            <FaChair /> View Reservation Details
          </button>
        </div>
      </div>
    </div>
  );
}
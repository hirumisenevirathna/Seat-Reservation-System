'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminHomePage() {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all p-4 sm:p-6"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Optional soft overlay */}
      <div className="absolute inset-0 bg-black/10 z-0" />

      <div
        className={`relative z-10 backdrop-blur-md bg-white/10 border border-white/30 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-3xl sm:max-w-4xl transition-all duration-700 ease-out ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-white mb-6 sm:mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <button
            onClick={() => handleNavigate('/AdminApp/AdminSeatsPage')}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl border border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm font-medium text-sm sm:text-base"
          >
            ➕ Add / ✏️ Edit / 🗑️ Delete Seats
          </button>

          <button
            onClick={() => handleNavigate('/AdminApp/ViewDetailPage')}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl border border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm font-medium text-sm sm:text-base"
          >
            📅 View All Reservations
          </button>

          <button
            onClick={() => handleNavigate('/AdminApp/ManageReservationsPage')}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl border border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm font-medium text-sm sm:text-base"
          >
            🪑 Manually Assign Seats
          </button>

          <button
            onClick={() => handleNavigate('/AdminApp/SeatUsageReportPage')}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl border border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm font-medium text-sm sm:text-base"
          >
            📊 Generate Seat Usage Reports
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle logout with confirmation and token removal
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setIsLoading(true);
      try {
        localStorage.removeItem("token"); // Remove token from localStorage
        router.push("/home");
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white text-gray-800 shadow-lg">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.jpg"
            alt="SLT MOBITEL Logo"
            width={120}
            height={40}
            className="object-contain w-24 sm:w-32 lg:w-40"
            priority
          />
        </div>

        {/* Hamburger Menu Button (visible on mobile) */}
        <button
          className="sm:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } sm:flex flex-col sm:flex-row sm:items-center absolute sm:static top-14 left-0 right-0 bg-white sm:bg-transparent shadow-md sm:shadow-none p-4 sm:p-0 space-y-3 sm:space-y-0 sm:space-x-6 text-base sm:text-lg font-semibold z-50`}
        >
          <Link
            href="/AdminApp/AdminSeatsPage"
            className="hover:text-blue-600 transition duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Edit Seats
          </Link>
          <Link
            href="/AdminApp/ManageReservationsPage"
            className="hover:text-blue-600 transition duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Manage Seat Reservation
          </Link>
          <Link
            href="/AdminApp/ViewDetailPage"
            className="hover:text-blue-600 transition duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            View All Reservation
          </Link>
          <Link
            href="/AdminApp/SeatUsageReportPage"
            className="hover:text-blue-600 transition duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Seat Usage Report
          </Link>
          <button
            onClick={handleLogout}
            className={`hover:text-red-600 transition duration-300 text-left ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            Logout
          </button>
        </div>

        {/* Profile Icon */}
        <div className="hidden sm:flex items-center">
          <Image
            src="/profile.png"
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full border-2 border-gray-200 hover:border-blue-600 transition duration-300 cursor-pointer"
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
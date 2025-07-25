"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white text-gray-800 shadow-md">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.jpg"
            alt="SLT MOBITEL Logo"
            width={160}
            height={50}
            className="object-contain"
            priority
          />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8 text-lg font-semibold">
          <Link href="/NavApp/About" className="hover:text-blue-600 transition duration-300">
            About
          </Link>
          <Link href="/NavApp/view-seats" className="hover:text-blue-600 transition duration-300">
            View Seat
          </Link>
          <Link href="/NavApp/MyReservations" className="hover:text-blue-600 transition duration-300">
            My Reservations
          </Link>
          <button
            onClick={handleLogout}
            className={`hover:text-red-600 transition duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            Logout
          </button>
        </div>

        {/* Profile Icon */}
        <div className="flex items-center">
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
      <main className="p-6">{children}</main>
    </div>
  );
}
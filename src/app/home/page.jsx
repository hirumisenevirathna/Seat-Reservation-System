"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "../../utils/auth";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      // Optionally redirect authenticated users to another page, e.g., dashboard
      // router.push("/dashboard");
    } else {
      router.push("/home"); // Redirect to /home only if not authenticated
    }
  }, [router]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/home");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-black"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>

      {/* Logo at top-left */}
      <div className="absolute top-6 left-6 z-10">
        <Image src="/logo.jpg" alt="Logo" width={300} height={200} />
      </div>

      {/* Center Content */}
      <div className="relative z-10 text-white text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to the <span className="font-extrabold">Seat Reservation System</span>
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Book your seats with ease and efficiency.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <div className="flex justify-center gap-4 flex-wrap">
            {/* Show "View Seats" button only for non-authenticated users */}
            {!user && (
              <Link href="/login">
                <button className="px-6 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-white/10 transition duration-300">
                  View Seats
                </button>
              </Link>
            )}

            {/* Show "Go to Dashboard" or similar for authenticated users */}
            {user && (
              <Link href="/NavApp/view-seats"> {/* Adjust the href as needed */}
                <button className="px-6 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-white/10 transition duration-300">
                  View Seats
                </button>
              </Link>
            )}

            {user && (
              <button
                className="px-6 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-white/10 transition duration-300"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {user && (
          <p className="mt-4 text-sm text-gray-200">
            Logged in as: <span className="font-semibold">{user.email}</span>
          </p>
        )}
      </div>
    </div>
  );
}
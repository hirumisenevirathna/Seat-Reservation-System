"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";  
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const router = useRouter();  

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', formData);
      alert(res.data.message);
      localStorage.setItem('token', res.data.token);
      const token = res.data.token;
      const user = jwtDecode(token); // e.g., { id, email }
      localStorage.setItem("user", JSON.stringify(user));

      console.log("User data:", user);
      console.log("Name:", user.fullName);
      console.log("Redirecting to:", '/NavApp/view-seats'); // Debug log
      router.push('/NavApp/view-seats');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
    console.log("Token:", localStorage.getItem('token'));
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-md font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup">
            <span className="text-green-600 hover:underline font-medium cursor-pointer">
              Signup here
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
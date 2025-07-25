'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/signup', formData);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Transparent Overlay */}
      <div className="absolute inset-0 bg-white/3 backdrop-blur-sm z-0"></div>

      {/* Signup Form Card */}
      <div className="relative z-10 bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-green-100">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Signup</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-md font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
          >
            Signup
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login">
            <span className="text-blue-600 hover:underline font-medium cursor-pointer">
              Login here
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}

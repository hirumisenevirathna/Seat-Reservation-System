"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-4 md:mx-auto p-8 md:p-12 text-white bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-blue-200 drop-shadow-lg">
          Sri Lanka Telecom (SLT)
        </h1>

        <p className="text-lg md:text-xl leading-relaxed text-white/90">
          Sri Lanka Telecom (SLT) is the National Information and Communications Technology (ICT) solutions provider and the leading broadband and backbone infrastructure services provider of Sri Lanka. For over 163 years, the Company has served the Nation’s need for connectivity, operating on fixed, mobile, and other operational segments.
          <br /><br />
          SLT fulfils the needs of over nine million customers in the island through its high-speed fibre, copper, and wireless access network. The Company’s transformation into a digital service provider has enabled it to move beyond telecommunications services to provide a variety of solutions that cater to a digital lifestyle.
          <br /><br />
          SLT is positioned as a key global player by connecting Sri Lanka to the world through international submarine cable systems.
        </p>
      </div>
    </div>
  );
}

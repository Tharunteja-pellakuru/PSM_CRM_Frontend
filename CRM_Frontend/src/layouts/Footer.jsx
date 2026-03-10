import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full text-slate-500 text-sm mt-auto pt-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="font-medium text-center md:text-left text-slate-600">
          © {year} <span className="text-[#18254D] font-semibold">Parivartan CRM</span>. All Rights Reserved.
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center justify-center font-medium bg-slate-100/80 px-3 py-1 rounded-lg text-xs text-slate-600 border border-slate-200">
          Version 1.0
        </div>

        {/* Right */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-medium text-slate-500">
          <a href="/privacy" className="hover:text-[#18254D] transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-[#18254D] transition-colors">
            Terms
          </a>
          <a href="/support" className="hover:text-[#18254D] transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

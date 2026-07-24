import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t bg-slate-950 text-slate-300">
  <div className="mx-auto max-w-7xl px-6 py-12">
    <div className="grid gap-10 md:grid-cols-3">

      {/* Logo */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          SmartPaper
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Create professional, print-ready question papers effortlessly
          with real-time formatting and live preview.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">
          Quick Links
        </h3>

        <ul className="space-y-3">
          <li><a href="/">Home</a></li>
          <li><a href="/work">How It Works</a></li>
          {/* <li><a href="/features">Features</a></li>
          <li><a href="/contact">Contact</a></li> */}
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">
          Contact
        </h3>

        <ul className="space-y-3 text-sm">
          <li>support@smartpaper.com</li>
          <li>Nepal</li>
          <li>+977 98XXXXXXXX</li>
        </ul>
      </div>

    </div>

    <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col gap-3 md:flex-row md:justify-between">
      <p className="text-sm">
        © 2026 SmartPaper. All rights reserved.
      </p>

      <div className="flex gap-6 text-sm">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>
  )
}

export default Footer;
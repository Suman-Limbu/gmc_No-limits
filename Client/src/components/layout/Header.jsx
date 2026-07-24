import React from "react";
import { Link, NavLink } from "react-router-dom";
import Button from "../ui/Button";

const Header = () => {
  const navList = [
    { label: "Home", path: "/" },
    { label: "Work", path: "/work" },
    // { label: "About", path: "/about" },
    // { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="h-16 bg-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Logo
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {navList.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        

{/* login */}
<div className=" rounded-full p-2">
    <Button>Sign up</Button>
</div>
      </div>
    </header>
  );
};

export default Header;
import React from "react";

const Header = () => {
  // Assume you stored the username in localStorage after login.
  const username = localStorage.getItem("username") || "Guest";

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <div>Logged in as: <span className="font-semibold">{username}</span></div>
    </header>
  );
};

export default Header;

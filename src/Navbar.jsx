import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Firebase auth
import logo from "./assets/logo.png"; // Import the kokopelli image

const Navbar = () => {
  const [user, setUser] = useState(null); // Track logged-in user
  const navigate = useNavigate();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // User is logged in
      } else {
        setUser(null); // No user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <nav className="bg-custom-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-4">
          <img src={logo} alt="Kokopelli Logo" className="h-20 mb-4" />

          <h1 className="text-2xl font-bold mb-2">Tye's Byway Blog</h1>

          <p className="italic text-center mb-4">
            "I believe the beauty of nature can be found within as without and
            is limited, not by the size or amplitude of it, but by one's
            imagination."
          </p>

          <div className="flex space-x-4 mt-4">
            <Link
              to="/"
              className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              About
            </Link>
            {user ? (
              <>
                <Link
                  to="/admin"
                  className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

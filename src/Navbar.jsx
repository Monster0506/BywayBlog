import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Firebase auth

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
        setUser(null); // User logged out
        navigate("/login"); // Redirect to login page
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Twoblog</h1>
          </div>
          <div className="hidden sm:block">
            <div className="flex space-x-4">
              {/* Home Link */}
              <Link
                to="/"
                className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>

              {/* Show Admin and Logout only if user is logged in */}
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
                // Show Login only if user is not logged in
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
      </div>
    </nav>
  );
};

export default Navbar;

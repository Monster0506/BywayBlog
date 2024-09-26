import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { updatePassword, updateEmail } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";

const UserSettings = () => {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch the current user and their username from Firestore
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUserDetails();
  }, []);

  // Handle username change
  const handleUsernameChange = async (e) => {
    e.preventDefault();
    if (!newUsername) {
      setMessage("Please enter a new username.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        username: newUsername,
      });
      setUsername(newUsername);
      setNewUsername("");
      setMessage("Username updated successfully!");
    } catch (error) {
      console.error("Error updating username: ", error);
      setMessage("Failed to update username.");
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    try {
      await updatePassword(currentUser, newPassword);
      setNewPassword("");
      setMessage("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password: ", error);
      setMessage("Failed to update password.");
    }
  };

  return (
    <div className="min-h-screen custom-vertical-gradient">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-custom-green text-center">
          User Settings
        </h1>

        {/* Update Username */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Change Username</h2>
          <p className="mb-4">Current Username: {username}</p>
          <form onSubmit={handleUsernameChange}>
            <div className="mb-4">
              <label
                htmlFor="new-username"
                className="block text-gray-700 mb-2"
              >
                New Username
              </label>
              <input
                type="text"
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-custom-green text-white py-2 rounded hover:bg-custom-green"
            >
              Update Username
            </button>
          </form>
        </div>

        {/* Update Password */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="block text-gray-700 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-custom-green text-white py-2 rounded hover:bg-custom-green"
            >
              Update Password
            </button>
          </form>
        </div>

        {message && (
          <p className="text-center text-green-500 mt-4">{message}</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserSettings;

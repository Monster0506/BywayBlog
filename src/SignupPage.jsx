import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"; // Import Firebase modules
import Navbar from "./Navbar"; // Include the Navbar

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Signup successful! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Redirect to the login page after 2 seconds
    } catch (error) {
      setError("Failed to create an account. Please try again.");
    }
  };

  // Handle Google Sign-Up
  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSuccess("Signup successful! Redirecting...");
      setTimeout(() => {
        navigate("/admin");
      }, 2000); // Redirect to the admin page after 2 seconds
    } catch (error) {
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg mt-8">
          <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-4">{success}</p>
          )}
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirm-password"
                className="block text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-custom-green text-white py-2 rounded hover:bg-custom-green"
            >
              Sign Up
            </button>
          </form>

          {/* Google Sign-Up Button */}
          <div className="mt-4">
            <button
              onClick={handleGoogleSignUp}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Sign Up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

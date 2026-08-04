// Citations:
// Rana, U. [Programming Fields]. (2025, December 18). How to Handle Form Validation in React
// | Errors + Tailwind Styling | React 19 - Ep 09 [Video]. YouTube.
// https://youtu.be/k1xMMHea2Ms?si=5G2hWvodOcR5SpI-
//
// Rana, U. [Programming Fields]. (2026, January 12). How to Build Login Flow in React
// | Switch Login & Register Screens | React 19 - Ep 13 [Video]. YouTube.
// https://youtu.be/137uPoV_3xE?si=nLyIKUzqNak-IFK6

// The password eye buttons were generated with the help of Google Gemini. This transcript
// https://share.google/aimode/6RWI7S3UkBJRKQ9TZ documents the GenAI interaction that lead
// to the generation of this code

import "../styles/Forms.css"

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { usersApi } from "../services/api";

export const Login = () => {
  const navigate = useNavigate();
  const { getProfile } = useOutletContext();
  const [errors, setErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [serverResponse, setServerResponse] = useState({
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  // To show the password
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Values for form inputs
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle change function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);
    setIsFormSubmitted(true);

    try {
      const data = await usersApi.login(formData)

      // Successful API Response
      setServerResponse({
        type: "success",
        message: data.message || "Logged in successfully!",
      });

      if (getProfile) {
        await getProfile();
      }

      navigate("/trips", { replace: true });

    } catch (error) {

      setServerResponse({
        type: "error",
        message: error.message || "Unable to connect to the server.",
      });

    } finally{
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 chars long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-heading">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="text"
              name="email"
              onChange={handleChange}
              value={formData.email}
              placeholder="Enter email address"
              className="form-input"
            />
            {errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handleChange}
                value={formData.password}
                placeholder="Enter password"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          <div className="submit-wrapper">
            <button
              className="submit-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="toggle-wrapper">
          <p>
            Don't have an account?{" "}
            <button
              className="toggle-btn"
              type="button"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </p>
        </div>

        {serverResponse.message && (
            <p className={`banner ${
            serverResponse.type === "error" ? "banner-error" : "banner-success"
            }`}>
            {serverResponse.message}
            </p>
        )}
      </div>
    </div>
  );
};
// Citations:
// Rana, U. [Programming Fields]. (2025, December 18). How to Handle Form Validation in React
// | Errors + Tailwind Styling | React 19 - Ep 09 [Video]. YouTube.
// https://youtu.be/k1xMMHea2Ms?si=5G2hWvodOcR5SpI-
//
// Rana, U. [Programming Fields]. (2025, December 27). How to Submit Form Data in React |
// Send POST Request with Fetch API | React 19 - Ep 10 [Video]. YouTube.
// https://youtu.be/e3JgOVLLcAs?si=zq25X8sezicEr1CJ

// The password eye buttons were generated with the help of Google Gemini. This transcript
// https://share.google/aimode/6RWI7S3UkBJRKQ9TZ documents the GenAI interaction that lead
// to the generation of this code

import "../styles/Forms.css"

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../services/api";

export const Registration = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [serverResponse, setServerResponse] = useState({
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // To show the password
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // To show the confirm password
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Values for form inputs
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword:"",
  });

  // Values for preview
  const [submitPayload, setSubmitPayload] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
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

      // re-format for backend
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const data = await usersApi.create(payload);

      // Successful API Response
      setServerResponse({
        type: "success",
        message: data.message || "User Registered successfully!",
      });
      setSubmitPayload({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username
      });
      clearForm();
      setErrors({});
      setIsFormSubmitted(true);
    } catch (error) {
      setServerResponse({
        type: "error",
        message: error.message || "Unable to create user.",
      });
      setIsFormSubmitted(false);

    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  }

  const validateForm = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Please enter your first name";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Please enter your last name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Please enter a username";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 chars long";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-heading">
          Registration Form
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              onChange={handleChange}
              value={formData.firstName}
              placeholder="Enter your first name"
              className="form-input"
            />
            {errors.firstName && (
              <p className="error-message">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              onChange={handleChange}
              value={formData.lastName}
              placeholder="Enter your first name"
              className="form-input"
            />
            {errors.lastName && (
              <p className="error-message">{errors.lastName}</p>
            )}
          </div>

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
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              onChange={handleChange}
              value={formData.username}
              placeholder="Enter a username"
              className="form-input"
            />
            {errors.username && (
              <p className="error-message">{errors.username}</p>
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

            <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  placeholder="Re-enter your password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="submit-wrapper">
            <button
              className="submit-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>

        <div className="toggle-wrapper">
          <p>
            Have an account?{" "}
            <button
              className="toggle-btn"
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>
        </div>

        {isFormSubmitted && serverResponse.type === "success" && (
          <div className="preview-container">
            <h3 className="preview-title">Form Preview</h3>
            <h4 className="preview-text">First Name: {submitPayload.firstName}</h4>
            <h4 className="preview-text">Last Name: {submitPayload.lastName}</h4>
            <h4 className="preview-text">Email: {submitPayload.email}</h4>
            <h4 className="preview-text">Username: {submitPayload.username}</h4>
          </div>
        )}


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
// citation: https://youtu.be/YHiKHJbaTaY?si=Q_gdAE5wCmLruB-s
// citation: AI enhanced

import "../../styles/Forms.css"

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../../services/api";

export const Login = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [serverResponse, setServerResponse] = useState({
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

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

      // if we get a return token then login
      if (data && data.access_token) {

        localStorage.setItem("access_token", data.access_token);

        // Successful API Response
        setServerResponse({
          type: "success",
          message: data.message || "Logged in successfully!",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);

      }
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
          Login Form
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
            <input
              id="password"
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              placeholder="Enter password"
              className="form-input"
            />
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
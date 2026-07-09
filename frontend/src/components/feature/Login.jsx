// citation: https://youtu.be/YHiKHJbaTaY?si=Q_gdAE5wCmLruB-s

import "../../styles/Forms.css"

import { useEffect, useState } from "react";

export const Login = ({setPage}) => {
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
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && Array.isArray(data.detail)) {
            const fastapiErrors = {};
            data.detail.forEach((err) => {
            const fieldName = err.loc[err.loc.length - 1];
            fastapiErrors[fieldName] = err.msg;
            });
            setErrors(fastapiErrors);
        } else {
            setServerResponse({
            type: "error",
            message: data.detail || "Invalid credentials. Please try again.",
            });
        }
        setIsLoading(false);
        return;
      }

      // Reset errors
      setErrors({});

      // get returned token
      localStorage.setItem("token", data.access_token);

      // page for redirection
      setPage("dashboard");

      // Successful API Response
      setServerResponse({
        type: "success",
        message: data.message || "Logged in successfully!",
      });
      setIsLoading(false);
    } catch (error) {
      console.log("API Error: ", error);
      setServerResponse({
        type: "error",
        message: "Unable to connect to FastAPI backend.",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!serverResponse.message) return;
    const timer = setTimeout(() => {
      setServerResponse({ type: "", message: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [serverResponse.message]);

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
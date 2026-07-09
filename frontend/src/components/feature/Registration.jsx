// citation: https://youtu.be/k1xMMHea2Ms?si=qiSzGC1DGfF6tMR9

import "../../styles/Forms.css"

import { useEffect, useState } from "react";

export const Registration = () => {
  const [errors, setErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [serverResponse, setServerResponse] = useState({
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Values for form inputs
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword:"",
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
      const response = await fetch("http://localhost:8000/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Successful API Response
      setServerResponse({
        type: "success",
        message: data.message || "User Registered successfully!",
      });
      setErrors({});
      setIsFormSubmitted(true);
      setIsLoading(false);

    } catch (error) {
      console.log("API Error: ", error);
      setServerResponse({
        type: "error",
        message: "Unable to connect to FastAPI backend.",
      });
      setIsLoading(false);
      setIsFormSubmitted(false);
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

            <div>
            <label htmlFor="confirm-password" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              placeholder="Re-enter your password"
              className="form-input"
            />
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
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="preview-container">
            <h3 className="preview-title">Form Preview</h3>
            <h4 className="preview-text">First Name: {formData.firstName}</h4>
            <h4 className="preview-text">Last Name: {formData.lastName}</h4>
            <h4 className="preview-text">Email: {formData.email}</h4>
            <h4 className="preview-text">Username: {formData.username}</h4>
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
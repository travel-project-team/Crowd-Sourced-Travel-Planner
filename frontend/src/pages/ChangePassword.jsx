// Citation: AI enhanced with Google AI

// The password eye buttons were generated with the help of Google Gemini. This transcript
// https://share.google/aimode/6RWI7S3UkBJRKQ9TZ documents the GenAI interaction that lead
// to the generation of this code

import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

// Custom
import { usersApi } from "../services/api";
import "../styles/Profile.css"
import "../styles/Forms.css"

export const ChangePassword = () => {
  const { user, getProfile } = useOutletContext();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  // For toggling the current password field
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  // For toggling the new password field
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  // For toggling the confirm password field
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setconfirmPassword] = useState('');

  // To show the current password
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword((prev) => !prev);
  };

  // To show the new password
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev);
  };

    // To show the confirm new password
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const [formData, setFormData] = useState({
    current_password:"",
    new_password: "",
    confirmPassword:"",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    try{
        // re-format for backend
        const payload = {
            current_password: formData.current_password,
            new_password: formData.new_password,
        };

        await usersApi.updatePassword(payload);
        if (getProfile) {
            await getProfile();
        }
        navigate("/profile");
     }catch (error){
        console.error("Profile update error", error);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.current_password.trim()) {
      newErrors.current_password = "Please enter your current password";
    }

    if (!formData.new_password.trim()) {
      newErrors.new_password = "Please enter a new password";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 chars long";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-heading">Change Password</h2>
        <form onSubmit={handleSubmit} className="profile-grid">

            <div>
            <label htmlFor="password" className="form-label">
              Enter current Password
            </label>
            <div className="password-wrapper">
              <input
                id="current_password"
                type={showCurrentPassword ? "text" : "password"}
                name="current_password"
                onChange={handleChange}
                value={formData.current_password}
                placeholder="Enter password"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleCurrentPasswordVisibility}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? (
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
            {errors.current_password && (
              <p className="error-message">{errors.current_password}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <div className="password-wrapper">
              <input
                id="new_password"
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                onChange={handleChange}
                value={formData.new_password}
                placeholder="Enter new password"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleNewPasswordVisibility}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
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
            {errors.new_password && (
              <p className="error-message">{errors.new_password}</p>
            )}
          </div>

            <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <div className="password-wrapper">
              <input
                id="confirm-password"
                type={confirmPassword ? "text" : "password"}
                name="confirmPassword"
                onChange={handleChange}
                value={formData.confirmPassword}
                placeholder="Re-enter your new password"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={confirmPassword ? 'Hide password' : 'Show password'}
              >
                {confirmPassword ? (
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
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="profile-actions-bar">
            <button type="submit" className="btn-save-edit">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="btn-cancel-edit"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
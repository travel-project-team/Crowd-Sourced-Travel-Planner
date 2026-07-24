// Citation: AI enhanced with Google AI
import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

// Custom
import { usersApi } from "../services/api";
import "../styles/Profile.css"

export const ChangePassword = () => {
  const { user, getProfile } = useOutletContext();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});


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
            <input
              id="current_password"
              type="password"
              name="current_password"
              onChange={handleChange}
              value={formData.current_password}
              placeholder="Enter password"
              className="form-input"
            />
            {errors.current_password && (
              <p className="error-message">{errors.current_password}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              id="new_password"
              type="password"
              name="new_password"
              onChange={handleChange}
              value={formData.new_password}
              placeholder="Enter new password"
              className="form-input"
            />
            {errors.new_password && (
              <p className="error-message">{errors.new_password}</p>
            )}
          </div>

            <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              placeholder="Re-enter your new password"
              className="form-input"
            />
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
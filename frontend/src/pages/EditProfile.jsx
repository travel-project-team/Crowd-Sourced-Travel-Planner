import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

// Custom
import { usersApi } from "../services/api";
import "../styles/Profile.css"

export const EditProfile = () => {
  const { user, getProfile } = useOutletContext();
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: ""
  });


  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
        await usersApi.update(formData);
        if (getProfile) {
            await getProfile();
        }
        navigate("/profile");
     }catch (error){
        console.error("Profile update error", error);
    }
  };


  if (!user) {
    return <div className="profile-container">Loading editor...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-heading">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="profile-grid">

          <div className="profile-row">
            <label className="profile-label"><strong>First Name:</strong></label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="profile-input"
            />
          </div>

          <div className="profile-row">
            <label className="profile-label"><strong>Last Name:</strong></label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="profile-input"
            />
          </div>

          <div className="profile-row">
            <label className="profile-label"><strong>Username:</strong></label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="profile-input"
            />
          </div>

          <div className="profile-row">
            <label className="profile-label"><strong>Email Address:</strong></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="profile-input"
            />
          </div>

          <div className="profile-row">
            <p className="profile-label"><strong>Account Created:</strong></p>
            <p className="profile-value">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
            </p>
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
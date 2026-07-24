// citation: https://youtu.be/FdPVtRr_bUc?si=nDXCv5u2pF5VT709
import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import "../styles/Profile.css"
import { usersApi } from "../services/api";
import { getInitials } from "../helpers/getInitials";

export const Profile = () =>{
    const { user, deleteProfile, getProfile } = useOutletContext();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        avatar_url: ""
    });

    useEffect(() => {
        if (user) {
        setFormData({
            avatar_url: user.avatar_url || "",
        });
        }
    }, [user]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]); // Captures the true raw file blob object
        }
    };

    // Upload User Avatar
    const handleAvatarSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        const dataPayload = new FormData();
        dataPayload.append("file", selectedFile);
        try{
            await usersApi.uploadAvatar(dataPayload);

            setSelectedFile(null);

            if (getProfile) {
                await getProfile();
            }
            navigate("/profile");
        }catch (error){
            console.error("Profile update error", error);
        }
    };

    // Remove User Avatar
    const removeAvatarSubmit = async (e) => {
        e.preventDefault();
        try{
            await usersApi.removeAvatar();

            setSelectedFile(null);

            if (getProfile) {
                await getProfile();
            }
            navigate("/profile");
        }catch (error){
            console.error("Profile image removal error", error);
        }
    };

    return (
        <div className="profile-container">
        <div className="profile-card">
            <h2 className="profile-heading">My Profile</h2>

            <div className="profile-main-content">

            <div className="profile-grid">
            <div className="profile-row">
                <p className="profile-label"><strong>First Name</strong></p>
                <p className="profile-value">{user?.first_name || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label"><strong>Last Name:</strong></p>
                <p className="profile-value">{user?.last_name || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label"><strong>Username:</strong></p>
                <p className="profile-value">{user?.username || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label"><strong>Email Address:</strong></p>
                <p className="profile-value">{user?.email || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label"><strong>Account Created:</strong></p>
                <p className="profile-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
            </div>
        {user && (
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-circle">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={`${getInitials(user.first_name, user.last_name)}`}
                    className="profile-avatar-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span
                  className="profile-avatar-fallback"
                  style={{ display: user.avatar_url ? 'none' : 'flex' }}
                >
                  {getInitials(user.first_name, user.last_name)}
                </span>
              </div>

              <form onSubmit={handleAvatarSubmit} className="form-group avatar-upload-group">
                <label htmlFor="experience-image" className="avatar-upload-label">
                  Upload Image:
                </label>
                <input
                  type="file"
                  id="experience-image"
                  name="image_url"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {selectedFile && (
                  <button type="submit" className="btn-save-edit" style={{ marginTop: '8px', padding: '4px 10px', fontSize: '12px' }}>
                    Save Photo
                  </button>
                )}
                <button onClick={removeAvatarSubmit} type="submit" className="btn-save-edit" style={{ marginTop: '8px', padding: '4px 10px', fontSize: '12px' }}>
                    Remove Photo
                </button>
              </form>
            </div>
        )}
        </div>

            <div className="profile-actions-bar">
                <Link to="/profile/edit" className="btn-update-profile">Update Profile</Link>

                <Link to="/profile/change-password" className="btn-update-profile">
                    Update Password
                </Link>

                <button onClick={deleteProfile} type="button" className="btn-delete-account">
                    Delete Account
                </button>
            </div>
            </div>
        </div>
    );
};


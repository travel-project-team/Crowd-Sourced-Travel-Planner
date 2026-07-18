// citation: https://youtu.be/FdPVtRr_bUc?si=nDXCv5u2pF5VT709

import { useOutletContext } from "react-router-dom"
import "../styles/Profile.css"

export const Profile = () =>{
    const { user, deleteProfile } = useOutletContext();
    return (
        <div className="profile-container">
        <div className="profile-card">
            <h2 className="profile-heading">My Profile</h2>

            <div className="profile-grid">
            <div className="profile-row">
                <p className="profile-label">First Name:</p>
                <p className="profile-value">{user?.first_name || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label">Last Name:</p>
                <p className="profile-value">{user?.last_name || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label">Username:</p>
                <p className="profile-value">{user?.username || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label">Email Address:</p>
                <p className="profile-value">{user?.email || "N/A"}</p>
            </div>

            <div className="profile-row">
                <p className="profile-label">Account Created:</p>
                <p className="profile-value">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>

            <div className="profile-actions-bar">
                <button type="button" className="btn-update-profile">
                    Update Profile
                </button>

                <button onClick={deleteProfile} type="button" className="btn-delete-account">
                    Delete Account
                </button>
            </div>
            </div>
        </div>
        </div>
    );
};


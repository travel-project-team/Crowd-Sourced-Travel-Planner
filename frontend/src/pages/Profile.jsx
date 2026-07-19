// citation: https://youtu.be/FdPVtRr_bUc?si=nDXCv5u2pF5VT709

import { useOutletContext } from "react-router-dom"
import { Link } from "react-router";
import "../styles/Profile.css"

export const Profile = () =>{
    const { user, deleteProfile } = useOutletContext();
    return (
        <div className="profile-container">
        <div className="profile-card">
            <h2 className="profile-heading">My Profile</h2>

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

            <div className="profile-actions-bar">
                <Link to="/profile/edit" className="btn-update-profile">Update Profile</Link>

                <button onClick={deleteProfile} type="button" className="btn-delete-account">
                    Delete Account
                </button>
            </div>
            </div>
        </div>
        </div>
    );
};


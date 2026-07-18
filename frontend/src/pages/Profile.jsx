// citation: https://youtu.be/FdPVtRr_bUc?si=nDXCv5u2pF5VT709
import { useOutletContext } from "react-router-dom"
import "../styles/Dashboard.css"

export const Profile = () =>{
    console.log(useOutletContext());
    const { user } = useOutletContext();
    return (
        <div className="dashboard-container">
        <div className="dashboard-card">
            <h2 className="dashboard-heading">My Profile</h2>

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
            </div>
        </div>
        </div>
    );
};


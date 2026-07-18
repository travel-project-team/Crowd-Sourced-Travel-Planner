// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { useState } from "react";
import { Link } from "react-router";
import "../../styles/Header.css";
import { getInitials } from "../../helpers/getInitials.js";

export const Header = ({ user, logout }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="header-container">
      <h1 className="header-title">Dashboard</h1>
      <div className="header-actions">
        {user ? (
          <div className="profile-wrapper">
            <p className="welcome-message">
              Welcome, <strong className="welcome-name">{user.first_name} {user.last_name}</strong>!
            </p>
          </div>
        ) : (
          <div className="loading-message">
            <p>Loading profile...</p>
          </div>
        )}
      </div>

      {/* Profile dropdown */}
      <div className="profile-dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
        {user && (
          <>
            <button onClick={() => setOpen(!open)} className="profile-avatar-btn">
              {getInitials(user.first_name, user.last_name)}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="profile-dropdown-menu">
                <Link to="/profile" className="profile-dropdown-link">My Profile</Link>
                 {/* Logout */}
                <button onClick={logout} className="logout-button">Logout</button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};
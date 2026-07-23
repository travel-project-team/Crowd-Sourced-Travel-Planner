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
      <div className="profile-dropdown-container">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="profile-avatar-btn"
            style={{ padding: 0, overflow: 'hidden', border: 'none' }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`${getInitials(user?.first_name, user?.last_name)}`}
                className="profile-avatar-image"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
              style={{
                display: user?.avatar_url ? 'none' : 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getInitials(user?.first_name, user?.last_name)}
            </span>
          </button>

          {open && (
            <div className="profile-dropdown-menu">
              <Link
                to="/profile"
                className="profile-dropdown-link"
                onClick={() => setOpen(false)}
              >
                My Profile
              </Link>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
    </header>
  );
};
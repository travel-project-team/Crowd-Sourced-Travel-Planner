// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import "../../styles/Header.css";

export const Header = ({ user, logout }) => {
  return (
    <header className="header-container">
      <h1 className="header-title">Dashboard</h1>
      <div className="header-actions">
        {user ? (
          <div className="profile-wrapper">
            <p className="welcome-message">
              Welcome, <strong className="welcome-name">{user.first_name} {user.last_name}</strong>!
            </p>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        ) : (
          <div className="loading-message">
            <p>Loading profile...</p>
          </div>
        )}
      </div>
    </header>
  );
};
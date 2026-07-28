// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { NavLink } from "react-router-dom"
import "../styles/Sidebar.css"
export const Sidebar = ({user}) => {
  return (
    <aside className="sidebar-container">
      <h2>Crowd Sourced Travel Planner</h2>
      <nav>
        <NavLink to="/home">Home</NavLink>
        {(user) &&(
          <>
            <NavLink to="/trips">Your Trips</NavLink>
            <NavLink to="/experiences">Your Experiences</NavLink>
            <NavLink to="/search">Search Experiences</NavLink>
          </>
        )}
        {(!user) &&(
          <>
            <NavLink to="/login">Login</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};
// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { NavLink } from "react-router-dom"
import "../../styles/Sidebar.css"
export const Sidebar = () => {
  return (
    <aside className="sidebar-container">
      <h2>Crowd Sourced Travel Planner</h2>
      <nav>
        <NavLink to="/dashboard">Home</NavLink>
        <NavLink to="/trips">Discover</NavLink>
      </nav>
    </aside>
  );
};
// Citations:
// Rana, U. [Programming Fields]. (2026, February 6). Build Dashboard Layout in React
// | Sidebar + Header UI Using Tailwind CSS | React 19 - Ep 21 [Video]. YouTube.
// https://youtu.be/JVCU2qsGvOs?si=o27keYL5cTGeeNSu

import { NavLink } from "react-router-dom"
import "../styles/Sidebar.css"
export const Sidebar = ({user}) => {
  return (
    <aside className="sidebar-container">
      <h2>Journey</h2>
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
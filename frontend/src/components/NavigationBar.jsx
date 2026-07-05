// Navigation Bar for all application pages
import { Link } from "react-router-dom";
import "../styles/NavigationBar.css";
export default function NavigationBar (){
    return(
        <nav id="navBar">
            <h2 className="logo">Crowd-Source Travel Planner</h2>
            <ul className="nav-links">
                <Link id="homelink" to="/">Home</Link>
                <Link id="search-experienceslink" to="/search-experiences">Search Experiences</Link>
                <Link id="user-profilelink" to="/user-profile">User Profile</Link>
            </ul>
        </nav>
    )
}
// citation: https://youtu.be/VeUz9i6MtFg?si=AoWUkrYKOWnh8m1H
// citation: AI enhanced

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../../services/api";
import { authentication } from "../../services/authentication";
import "../../styles/Dashboard.css"

export const Dashboard = () =>{
    const [user, setUser] = useState(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const token = localStorage.getItem("token");
        try{
           const data = await usersApi.getProfile();

           // if we get a return token then login
           if (data) {
            setUser(data);
            }

        }catch (error){
            console.error("Profile error", error);
        }
    }

// Logout
const logout = async () =>{
    try {
        authentication.logout();
        localStorage.removeItem("access_token");
        localStorage.clear();
        sessionStorage.clear();
    } catch (error) {
        console.error("Logout encountered a problem:", error);
    } finally {
        window.location.href = "/login";
    }
}


    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                <h2 className="dashboard-heading">Crowd-Sourced Travel Planner</h2>

                {user ? (
                <div className="profile-wrapper">
                    <p className="welcome-message">
                    Welcome, <strong className="welcome-name">{user.first_name} {user.last_name}</strong>!
                    </p>

                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
                ) : (
                <div className="loading-message">
                    <div className="loading-spinner"></div>
                    <p>Loading profile variables...</p>
                </div>
                )}
            </div>
        </div>
    );
}
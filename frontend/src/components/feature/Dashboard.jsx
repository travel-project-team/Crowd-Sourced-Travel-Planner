// citation: https://youtu.be/VeUz9i6MtFg?si=AoWUkrYKOWnh8m1H
// citation: AI enhanced

import { useEffect, useState } from "react";
import { usersApi } from "../../services/api";
import "../../styles/Dashboard.css"

export const Dashboard = () =>{
    const [user, setUser] = useState(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const token = localStorage.getItem("token");
        try{
           const data = await usersApi.getProfile()

           // if we get a return token then login
           if (data) {
            setUser(data);
            }

        }catch (error){
            console.error("Profile error", error);
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
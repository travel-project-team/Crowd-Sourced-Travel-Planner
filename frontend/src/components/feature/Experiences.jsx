import { experiencesApi, usersApi } from "../../services/api.js";
import { ExperienceCard } from "./ExperienceCard.jsx";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/Experiences.css";

export const Experiences = () => {
    const [experiences, setExperiences] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [experienceData, userData] = await Promise.all([
                    experiencesApi.getAll(),
                    usersApi.getProfile()
                ]);

                setExperiences(experienceData);
                setCurrentUser(userData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    },[]);

    if (loading) return <div className="experiences-container"><p>Loading your experiences...</p></div>;
    if (error) return <div className="experiences-container"><p>Error: {error}</p></div>;

    return (
        <div className="experiences-container">
            <h2 className="experiences-heading">Your Experiences</h2>
            <div className="experiences-body">
                {experiences.length === 0 ? (
                    <p>No experiences found. Time to plan a new one...</p>
                ) : (
                    experiences.map((experience) => (
                        <ExperienceCard 
                            key={experience._id} 
                            experience={experience} 
                            currentUser={currentUser}
                            onTripDeleted={(id) => setExperiences(prev => prev.filter(e => e.id !== id))}
                        />
                    ))
                )}
            </div> 
            <div>
                <Link to="/add-trip" className="add-button">
                    Add trip
                </Link>
                <Link to="/add-experience" className="add-button">
                    Add experience
                </Link>
            </div>
        </div>
    );
}
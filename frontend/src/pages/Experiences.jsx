// Citations:
// Some bug fixes were implemented with the assistance of Gemini.
// This transcript https://gemini.google.com/app/c4ffb4e81781dabe
// documents the Gen AI interaction that led to the generation of this code. 

import { experiencesApi } from "../services/api.js";
import { ExperienceCard } from "../components/ExperienceCard.jsx";
import { Link, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Experiences.css";

export const Experiences = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useOutletContext();

    useEffect(() => {
        const loadData = async () => {
            try {
                const experienceData = await experiencesApi.getUser();

                setExperiences(experienceData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    },[]);

// Delete: calls the API and updates state
    const handleDeleteExperience= async (experienceId) => {
        if (window.confirm("Are you sure you want to delete this Experience?")) {
            try {
                await experiencesApi.remove(experienceId);
                setExperiences(prev => prev.filter(e => e._id !== experienceId));
            } catch (err) {
                alert(`Failed to delete experience: ${err.message}`);
            }
        }
    };

    if (loading) return <div className="experiences-container"><p>Loading your experiences...</p></div>;
    if (error) return <div className="experiences-container"><p>Error: {error}</p></div>;

    return (
        <div className="experiences-container">
            <h2 className="experiences-heading">Your Experiences</h2>
            <div>
                <Link to="/add-trip" className="add-button">
                    Add trip
                </Link>
                <Link to="/add-experience" className="add-button">
                    Add experience
                </Link>
            </div>
            <div className="experiences-body">
                {experiences.length === 0 ? (
                    <p>No experiences found. Time to plan a new one...</p>
                ) : (
                    experiences.map((experience) => (
                        <ExperienceCard
                            key={experience._id}
                            experience={experience}
                            currentUser={user}
                            onExperienceDeleted={handleDeleteExperience}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tripsApi, experiencesApi, usersApi } from "../../services/api";
import "../../styles/Experiences.css";

export const ExperienceCard = ( { experience, currentUser, onExperienceDeleted } ) => {
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/edit-experience/${experience._id}`, { state: { experience } });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this experience?")) {
            try {
                await experiencesApi.remove(experience._id);
                if (onExperienceDeleted) {
                    onExperienceDeleted(experience._id);
                }
            } catch (err) {
                alert(`Failed to delete experience: ${err.message}`);
            }
        }
    };

    const handleViewSingleExperience = () => {
        navigate(`/single-experience/${experience._id}`);
    };
    
    return(
        <div className="experience-card">
            <div className="experience-actions">
                <button className="action-btn edit-btn" onClick={handleEdit} title="Edit Experience">
                    ✏️
                </button>
                <button className="action-btn delete-btn" onClick={handleDelete} title="Delete Experience">
                    🗑️
                </button>
            </div>
            <p className="experience-title">{experience.title}</p>
            <p className="experience-attr">{experience.description}</p>
            <p className="experience-attr">Location: {experience.location_name} </p>
            <p className="experience-attr">Keywords: {experience.keywords}</p>
            <p className="experience-attr">Average rating: {experience.average_rating}</p>
            <button className="full-details-button-link" onClick={handleViewSingleExperience}>
                View Full Details
            </button>
        </div>
    )
}
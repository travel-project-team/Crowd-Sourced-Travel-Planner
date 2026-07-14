import { useLocation, useNavigate } from "react-router-dom";
import { experiencesApi } from "../../services/api.js";
import "../../styles/Experience.css";

export const SingleExperience = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { experience } = location.state || {};

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/edit-experience/${experience._id}`, { state: { experience }});
    }

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this experience?")) {
            try {
                await experiencesApi.remove(experience._id);
                alert("Experience deleted successfully.");

                navigate(-1);
            } catch (err) {
                alert(`Failed to delete experience ${err.message}`);
            }
        }
    }

    if (!experience) {
        return(
            <div className="experience-container">
                <p>No experience data found. Please return to previous page.</p>
                <button className="back-button" onClick={() => navigate(-1)}>Back</button>
            </div>
        )
    }

    return(
        <div className="experience-container">
            <div className="experience-div">
                <p className="experience-title">{experience.title}</p>
                <p className="experience-attr">{experience.description}</p>
                <p className="experience-attr">{experience.location_name}</p>
                <p className="experience-attr">Coordinates: {experience.location_geojson.coordinates.join(", ")}</p>

                {experience.average_rating && (
                    <p className="experience-attr"><strong>Average Rating:</strong> {experience.average_rating}</p>
                )}

                {experience.keywords?.length > 0 && (
                    <p className="experience-attr"><strong>Keywords:</strong> {experience.keywords.join(", ")}</p>
                )}
            </div>
            <div className="experience-div">
                {experience.image_url && (
                    <img className="experience-img" src={experience.image_url} alt={experience.title} />
                )}
                <div className="experience-actions">
                    <button className="back-button" onClick={() => navigate(-1)}>Back</button>
                    <button className="action-btn edit-btn" onClick={handleEdit} title="Edit Experience">
                        ✏️
                    </button>
                    <button className="action-btn delete-btn" onClick={handleDelete} title="Delete Experience">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    )
}
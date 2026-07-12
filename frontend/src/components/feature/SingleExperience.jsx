import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Experience.css";

export const SingleExperience = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { experience } = location.state || {};

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/edit-experience/${experience._id}`, { state: { experience }});
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this experience?")) {
            console.log("Delete experience:", experience._id);
            navigate(-1);
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
                <p className="experience-attr">Coordinates: {experience.location_jeojson.coordinates.join(", ")}</p>
                <p className="experience-attr">Average Rating: {experience.average_rating}</p>
                <p className="experience-attr">Keywords: {experience.keywords.join(", ")}</p>
            </div>
            <div className="experience-div">
                <img className="experience-img" src={experience?.image_url} alt={experience?.title} />
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
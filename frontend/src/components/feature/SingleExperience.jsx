import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { experiencesApi } from "../../services/api.js";
import "../../styles/SingleExperience.css";

export const SingleExperience = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [experience, setExperience] = useState(location.state?.experience || null);
    const [loading, setLoading] = useState(!experience);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (experience) return;

        const fetchExperience = async () => {
            try {
                setLoading(true);
                const response = await experiencesApi.getById(id);
                setExperience(response.data || response);
                setError(null);
            } catch (err) {
                setError(err.message || "Failed to load experience details.");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchExperience();
        }

    },[id, experience])

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

    if (loading) {
        return (
            <div className="single-experience-container">
                <p>Loading experience details...</p>
            </div>
        );
    }

    if (error || !experience) {
        return(
            <div className="single-experience-container">
                <p>No experience data found. Please return to previous page.</p>
                <button className="back-button" onClick={() => navigate(-1)}>Back</button>
            </div>
        )
    }

    return(
        <div className="single-experience-container">
            <div className="single-experience-div">
                <p className="single-experience-title">{experience.title}</p>
                <p className="single-experience-attr">{experience.description}</p>
                <p className="single-experience-attr">{experience.location_name}</p>
                <p className="single-experience-attr">Coordinates: {experience.location_geojson?.coordinates ? experience.location_geojson.coordinates.join(", ") : "N/A"}</p>
                <p className="single-experience-attr">Average Rating: {experience.ratings.length === 0 ? "N/A"
                   : (experience.ratings.reduce((acc, currVal) => acc + currVal, 0)) / experience.ratings.length}</p>

                {experience.keywords?.length > 0 && (
                    <p className="single-experience-attr"><strong>Keywords:</strong> {experience.keywords.join(", ")}</p>
                )}
            </div>
            <div className="single-experience-div">
                {experience.image_url && (
                    <img className="single-experience-img" src={experience.image_url} alt={experience.title} />
                )}
                <div className="single-experience-actions">
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
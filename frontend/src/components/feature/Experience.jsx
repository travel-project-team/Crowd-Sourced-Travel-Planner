import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Experience.css";

export const Experience = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { experience } = location.state || {};

    return(
        <div className="experience-container">
            <div className="experience-div">
                <p className="experience-title">Title: {experience.title}</p>
                <p className="experience-attr">Description: {experience.description}</p>
                <p className="experience-attr">Location: {experience.location_name}</p>
                <p className="experience-attr">Coordinates: {experience.location_jeojson.coordinates.join(", ")}</p>
                <p className="experience-attr">Average Rating: {experience.average_rating}</p>
                <p className="experience-attr">Keywords: {experience.keywords.join(", ")}</p>
            </div>
            <div className="experience-div">
                <img className="experience-img" src={experience?.image_url} alt={experience?.title} />
                <button className="back-button" onClick={() => navigate(-1)}>Back to trips</button>
            </div>
        </div>
    )
}
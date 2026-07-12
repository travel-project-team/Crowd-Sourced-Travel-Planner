// Citation: AI enhanced formatting with Gemini.

import "../../styles/EditForms.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const EditExperience = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { experience } = location.state || {};

    const [formData, setFormData] = useState({
        title: experience?.title|| "",
        description: experience?.description || "",
        location_name: experience?.location_name || "",
        keywords: experience?.keywords || [],
        ratings: experience?.ratings || [],
        image_url: experience?.image_url || ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedFields = {}

        Object.keys(formData).forEach((key) => {
            if (formData[key] !== experience?.[key]) {
                updatedFields[key] = formData[key]
            }
        });

        navigate(-1);
    }

    if (!experience) {
        return(
            <div className="edit-container">
                <p>No data found. Please return to prior page.</p>
                <button className="back-button" onClick={() => navigate(-1)}>Back</button>
            </div>
        )
    }

    return (
        <div className="edit-container">
            <h2 className="edit-heading">Update Your Experience</h2>
            <form className="edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="experience-name">Experience Title:</label>
                    <input type="text" id="experience-name" name="title" value={formData.title} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="experience-description">Description:</label>
                    <textarea id="experience-description" name="description" value={formData.description} onChange={handleInputChange}></textarea>
                </div>    

                <div className="form-group">
                    <label htmlFor="experience-location">Location:</label>
                    <textarea id="experience-location" name="location_name" value={formData.location_name} onChange={handleInputChange}></textarea>
                </div>  

                <div className="form-group">
                    <label htmlFor="experience-keywords">Keywords</label>
                    <div className="input-with-button-row">
                        <input 
                            type="text"
                            id="experience-keywords"
                            name="keywords"
                            placeholder="Add keywords to help others can find your experience!"
                        />
                        <button type="button" className="inline-add-btn">Add</button>
                    </div>
                    <div className="tags-container">
                        <span className="tag-chip">Boating<button type="button" className="remove-tag">&times;</button></span>
                        <span className="tag-chip">Dancing<button type="button" className="remove-tag">&times;</button></span>
                    </div>
                </div>

                <div className="form-group">
                    <label>Your Rating:</label>
                    <div className="star-rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image_url">Upload Image:</label>
                    <input 
                        type="file" 
                        id="experience-image" 
                        name="image_url" 
                        accept="image/*"
                        className="file-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="trip-affiliation">Which of your Trips was this a part of?: </label>
                    <div className="input-with-button-row">
                        <select id="trip-affiliation" defaultValue="">
                            <option value="trip-1">Paris</option>
                            <option value="trip-2">Hong Kong</option>
                            <option value="trip-3">Portland</option>
                            <option value="no-trip" select>None</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="submit-button">Update Experience</button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        </div>
    )
}
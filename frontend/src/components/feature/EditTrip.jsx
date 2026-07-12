// Citation: AI enhanced formatting with Gemini.

import "../../styles/EditForms.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const EditTrip = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { trip } = location.state || {};

    const [formData, setFormData] = useState({
        trip_name: trip?.trip_name || "",
        trip_description: trip?.trip_description || "",
        collaborator_ids: trip?.collaborator_ids || [],
        experience_ids: trip?.experience_ids || []
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
            if (formData[key] !== trip?.[key]) {
                updatedFields[key] = formData[key]
            }
        });

        navigate(-1);
    }

    if (!trip) {
        return(
            <div className="edit-container">
                <p>No data found. Please return to trips page.</p>
                <button className="back-button" onClick={() => navigate(-1)}>Back to Trips</button>
            </div>
        )
    }

    return (
        <div className="edit-container">
            <h2 className="edit-heading">Update Your Trip</h2>
            <form className="edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="trip-name">Trip Name:</label>
                    <input type="text" id="trip-name" name="trip_name" value={formData.trip_name} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="trip-description">Description:</label>
                    <textarea id="trip-description" name="trip_description" value={formData.trip_description} onChange={handleInputChange}></textarea>
                </div>    

                <div className="form-group">
                    <label htmlFor="trip-collaborators">Collaborators</label>
                    <div className="input-with-button-row">
                        <input 
                            type="email"
                            id="trip-collaborators"
                            placeholder="Add by email."
                        />
                        <button type="button" className="inline-add-btn">Add</button>
                    </div>
                    <div className="tags-container">
                        <span className="tag-chip">jim@expample.org<button type="button" className="remove-tag">&times;</button></span>
                        <span className="tag-chip">john@expample.org<button type="button" className="remove-tag">&times;</button></span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trip-experiences">Experiences: </label>
                    <div className="input-with-button-row">
                        <select id="trip-experiences" defaultValue="">
                            <option value="" disabled select>Select from your unaffiliated experiences to add to this trip...</option>
                            <option value="exp-1">Scuba Diving</option>
                            <option value="exp-2">Eiffel Tower</option>
                        </select>
                        <button type="button" className="inline-add-btn">Add</button>
                    </div>
                    <div className="tag-container">
                        <span className="tag-chip">Scuba Diving<button type="button" className="remove-tag">&times;</button></span>
                    </div>
                </div>

                <button type="submit" className="submit-button">Update Trip</button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)}>Back to Trips</button>
        </div>
    )
}
// Citation: AI enhanced formatting with Gemini.

import "../../styles/EditForms.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tripsApi } from "../../services/api.js";

export const EditTrip = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { trip } = location.state || {};
    const tripId = trip._id;

    const [formData, setFormData] = useState({
        trip_name: trip?.trip_name || "",
        trip_description: trip?.trip_description || "",
        collaborator_ids: trip?.collaborator_ids || [],
        experience_ids: trip?.experience_ids || []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // These will be updated when new endpoints come in
    const availableExperiences = [
        { id: "exp-1", name: "Scuba Diving" },
        { id: "exp-2", name: "Eiffel Tower" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const updatedFields = {}

        Object.keys(formData).forEach((key) => {
            if (formData[key] !== trip?.[key]) {
                updatedFields[key] = formData[key]
            }
        });

        // If nothing changed
        if (Object.keys(updatedFields).length === 0) {
            navigate(-1);
            return;
        }

        try {
            await tripsApi.update(tripId, updatedFields);
            navigate(-1);
        } catch (err) {
            setError(err.message || "Failed to update your trip details.");
        } finally {
            setIsSubmitting(false);
        }
    };

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

            {error && <div className="error-banner" style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

            <form className="edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="trip-name">Trip Name:</label>
                    <input type="text" id="trip-name" name="trip_name" value={formData.trip_name} onChange={handleInputChange} required />
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
                            disabled
                        />
                        <button type="button" className="inline-add-btn" disabled>Add</button>
                    </div>
                    <div className="tags-container">
                        {formData.collaborator_ids.length > 0 ? (
                            formData.collaborator_ids.map(id => (
                                <span key={id} className="tag-chip">{id}<button type="button" className="remove-tag">&times;</button></span>
                            ))
                        ) : (
                            <span className="tag-chip" style={{ background: "#eee", color: "#666" }}>No collaborators added yet</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trip-experiences">Experiences: </label>
                    <div className="input-with-button-row">
                        <select id="trip-experiences" value="" onChange={() => {}} disabled>
                            <option value="" disabled>Select from your unaffiliated experiences to add to this trip...</option>
                            {availableExperiences.map(exp => (
                                <option key={exp.id} value={exp.id}>{exp.name}</option>
                            ))}
                        </select>
                        <button type="button" className="inline-add-btn" disabled>Add</button>
                    </div>
                    <div className="tag-container">
                        {formData.experience_ids.length > 0 ? (
                            formData.experience_ids.map(id => {
                                const match = availableExperiences.find(e => e.id === id);
                                return (
                                    <span key={id} className="tag-chip">{match ? match.name : id}<button type="button" className="remove-tag">&times;</button></span>
                                );
                            })
                        ) : (
                            <span className="tag-chip" style={{ background: "#eee", color: "#666" }}>No experiences added yet</span>
                        )}
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>Update Trip</button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)} disabled={isSubmitting}>Back to Trips</button>
        </div>
    )
}
// Citation: AI enhanced formatting with Gemini.

import "../../styles/AddForms.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { tripsApi, usersApi } from "../../services/api";

export const AddTrip = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [ownerId, setOwnerId] = useState(null);

    // These will be updated as new endpoints come in
    const [collaborators, setCollaborators] = useState(["jim@example.org", "john@example.org"]);
    const [experiences, setExperiences] = useState([{ id: "exp-1", name: "Scuba Diving" }]);
    const [emailInput, setEmailInput] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await usersApi.getProfile();
                
                const userId = profile._id;
                
                if (userId) {
                    setOwnerId(userId);
                } else {
                    throw new Error("Could not extract User ID from profile.");
                }
            } catch (err) {
                setError("Failed to verify user identity. Please try re-logging in.");
                console.error("Profile fetch error:", err);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchUserProfile();
    }, []);

    // Will get these with a useEffect hook once endpoint is ready. Filter them down to experiences owned by user,
    // not yet affiliated with trip.
    const availableExperiences = [
        { id: "exp-1", name: "Scuba Diving" },
        { id: "exp-2", name: "Eiffel Tower" }
    ];

    // Both UI Only for now.
    const handleAddCollaborator = () => {
        if (emailInput.trim() && !collaborators.includes(emailInput.trim())) {
            setCollaborators([...collaborators, emailInput.trim()]);
            setEmailInput("");
        }
    };

    const handleAddExperience = () => {
        const match = availableExperiences.find(exp => exp.id === selectedExperience);
        if (match && !experiences.some(e => e.id === match.id)) {
            setExperiences([...experiences, match]);
            setSelectedExperience("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const payload = {
            trip_name: tripName,
            trip_description: description,
            owner_id: ownerId
        }

        try {
            await tripsApi.create(payload);
            navigate("/trips");
        } catch (err) {
            setError(err.message || "Failed to create trip.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-container">
            <h2 className="add-heading">Add a New Trip</h2>

            {error && <div className="error-banner" style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

            <form className="add-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="trip_name">Trip Name:</label>
                    <input type="text" id="trip_name" name="trip_name" value={tripName} onChange={(e) => setTripName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="trip_description">Description:</label>
                    <textarea id="trip_description" name="trip_description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>    

                <div className="form-group">
                    <label htmlFor="trip-collaborators">Collaborators</label>
                    <div className="input-with-button-row">
                        <input 
                            type="email"
                            id="trip-collaborators"
                            placeholder="Add by email."
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <button type="button" className="inline-add-btn" onClick={handleAddCollaborator}>Add</button>
                    </div>
                    <div className="tags-container">
                        {collaborators.map(email => (
                            <span key={email} className="tag-chip">
                                {email}
                                <button type="button" className="remove-tag" onClick={() => setCollaborators(collaborators.filter(e => e !== email))}>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trip-experiences">Experiences: </label>
                    <div className="input-with-button-row">
                        <select id="trip-experiences" value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)}>
                            <option value="" disabled>Select from your unaffiliated experiences to add to this trip...</option>
                            {availableExperiences.map(exp => (
                                <option key={exp.id} value={exp.id}>{exp.name}</option>
                            ))}
                        </select>
                        <button type="button" className="inline-add-btn" onClick={handleAddExperience}>Add</button>
                    </div>
                    <div className="tag-container">
                        {experiences.map(exp => (
                            <span key={exp.id} className="tag-chip">
                                {exp.name}
                                <button type="button" className="remove-tag" onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))}>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>Add Trip</button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)} disabled={isSubmitting}>Back to trips</button>
        </div>
    )
}
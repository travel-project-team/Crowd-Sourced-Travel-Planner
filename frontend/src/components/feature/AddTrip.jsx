// Citation: AI enhanced formatting with Gemini.

import "../../styles/AddForms.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { tripsApi, usersApi, experiencesApi } from "../../services/api";

export const AddTrip = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [ownerId, setOwnerId] = useState(null);

    // These will be updated as new endpoints come in
    const [collaborators, setCollaborators] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [emailInput, setEmailInput] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");

    const [availableExperiences, setAvailableExperiences] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                const [profile, allTrips, allExperiences] = await Promise.all([
                    usersApi.getProfile(),
                    tripsApi.getAll(),
                    experiencesApi.getAll()
                ]);

                if (profile?._id) {
                    setOwnerId(profile._id);
                } else {
                    throw new Error("Could not extract User ID from profile.");
                }

                const tripsData = allTrips.data || allTrips || [];
                const experiencesData = allExperiences.data || allExperiences || [];

                const affiliatedIds = new Set(
                    tripsData.flatMap(trip => trip.experience_ids || [])
                );

                const unaffiliated = experiencesData.filter(
                    exp => !affiliatedIds.has(exp._id)
                );

                setAvailableExperiences(unaffiliated);

            } catch (err) {
                setError("Failed to load initial form data.");
                console.error("Initialize error:", err);
            }
        };

        initialize();
    }, []);

    const handleAddCollaborator = () => {
        const email = emailInput.trim();
        if (email && !collaborators.includes(email)) {
            setCollaborators([...collaborators, email]);
            setEmailInput("");
        }
    };

    const handleAddExperience = () => {
        const match = availableExperiences.find(exp => exp._id === selectedExperience);
        if (match && !experiences.some(e => e._id === match._id)) {
            setExperiences([...experiences, match]);
            setSelectedExperience("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            let collaboratorIds = [];

            const finalCollaborators = [...collaborators];
            const remainingEmail = emailInput.trim();
            if (remainingEmail && !finalCollaborators.includes(remainingEmail)) {
                finalCollaborators.push(remainingEmail);
            }

            if (finalCollaborators.length > 0) {
                const usersResult = await usersApi.getBatchByEmail({ emails: finalCollaborators });
                const usersData = usersResult.data || usersResult || [];
                collaboratorIds = usersData.map(user => user._id);

                if (collaboratorIds.length !== finalCollaborators.length) {
                    console.warn("Some collaborator emails could not be resolved to registered accounts.");
                }
            }

            const payload = {
                trip_name: tripName,
                trip_description: description,
                owner_id: ownerId,
                collaborator_ids: collaboratorIds,
                experience_ids: experiences.map(exp => exp._id)
            }

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
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCollaborator();
                                }
                            }}
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
                            {availableExperiences
                                .filter(ae => !experiences.some(e => e._id === ae._id))
                                .map(exp => (
                                    <option key={exp._id} value={exp._id}>{exp.title}</option>
                                ))
                            }
                        </select>
                        <button type="button" className="inline-add-btn" onClick={handleAddExperience}>Add</button>
                    </div>
                    <div className="tag-container">
                        {experiences.map(exp => (
                            <span key={exp.id} className="tag-chip">
                                {exp.title}
                                <button type="button" className="remove-tag" onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))}>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? "Adding Trip..." : "Add Trip"}
                </button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)} disabled={isSubmitting}>Back to trips</button>
        </div>
    )
}
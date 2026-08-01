// Citations:
// Some bug fixes were implemented with the assistance of Gemini.
// This transcript https://gemini.google.com/app/55e5a07551a20ac1
// documents the Gen AI interaction that led to the generation of this code. 

import "../styles/AddForms.css";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { tripsApi, usersApi, experiencesApi } from "../services/api";

export const AddTrip = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");

    const [collaborators, setCollaborators] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [emailInput, setEmailInput] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");

    const [availableExperiences, setAvailableExperiences] = useState([]);
    const [isLookingUpUser, setIsLookingUpUser] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useOutletContext();
    const currentUserEmail = user?.email || null;
    const ownerId = user?._id || null;

    useEffect(() => {
        const initialize = async () => {
            try {
                const [allTrips, allExperiences] = await Promise.all([
                    tripsApi.getAll(),
                    experiencesApi.getUser()
                ]);

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

    const handleAddCollaborator = async () => {
        const email = emailInput.trim().toLowerCase();
        setError(null);

        if (!email) return;

        if (currentUserEmail && currentUserEmail.toLowerCase() === email) {
            setError("You cannot add yourself as a collaborator!");
            return;
        }

        if (collaborators.some(c => c.email.toLowerCase() === email)) {
            setError("This user has already been added as a collaborator.");
            return;
        }

        setIsLookingUpUser(true);

        try {
            const usersResult = await usersApi.getBatchByEmail({ emails: [email] });
            const usersData = usersResult.data || usersResult || [];
            const foundUser = usersData[0];

            if (!foundUser || !foundUser._id) {
                setError(`No user found with the email "${email}".`);
                return;
            }

            setCollaborators(prev => [
                ...prev, 
                { id: String(foundUser._id), email: foundUser.email || email }
            ]);

            setEmailInput("");
        } catch (err) {
            setError("Failed to find collaborator email.")
        } finally {
            setIsLookingUpUser(false);
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
            let collaboratorIds = collaborators.map(c => c.id);

            const remainingEmail = emailInput.trim().toLowerCase();
            if (remainingEmail && !collaborators.some(c => c.email.toLowerCase() === remainingEmail)) {
                const userResult = await usersApi.getBatchByEmail({ emails: [remainingEmail] });
                const usersData = usersResult.data || usersResult || [];
                if (usersData[0]?._id) {
                    collaboratorIds.push(usersData[0]._id);
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
            setError("Failed to create trip.");
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
                    <p className="form-helper">Collaborate with other Journey users!</p>
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
                        {collaborators.length > 0 ? (
                            collaborators.map(c => (
                                <span key={c.id} className="tag-chip">
                                    {c.email}
                                    <button 
                                        type="button" 
                                        className="remove-tag" 
                                        onClick={() => handleRemoveCollaborator(c.id)}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="tag-chip" style={{ background: "#eee", color: "#666" }}>
                                No collaborators added yet
                            </span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trip-experiences">Experiences: </label>
                    <div className="input-with-button-row">
                        <select id="trip-experiences" value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)}>
                            <option value="" disabled>Select an experience to add</option>
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
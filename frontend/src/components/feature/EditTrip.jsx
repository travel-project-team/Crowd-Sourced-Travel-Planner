// Citation: AI enhanced formatting with Gemini.

import "../../styles/EditForms.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tripsApi, experiencesApi, usersApi } from "../../services/api.js";

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

    const [collaboratorInput, setCollaboratorInput] = useState("");
    const [isLookingUpUser, setIsLookingUpUser] = useState(false);
    const [collaboratorMap, setCollaboratorMap] = useState({});

    const [selectedExperienceId, setSelectedExperienceId] = useState("");
    const [allExperiences, setAllExperiences] = useState([]);
    const [isLoadingExperiences, setIsLoadingExperiences] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialCollaborators = async () => {
            if (trip.collaborator_ids.length === 0) return;
            try {
                const res = await usersApi.getBatchById({ user_ids: trip.collaborator_ids});
                const users = res.data || res || [];

                const map = {};
                users.forEach((u) => {
                    const userId = String(u._id);
                    map[userId] = u.email;
                });

                setCollaboratorMap(map);
            } catch (err){
                console.error("Failed to load initial collaborators", err);
            }
        };

        fetchInitialCollaborators();
    }, [trip]);

    useEffect(() => {
        const fetchUserExperiences = async () => {
            setIsLoadingExperiences(true);
            try {
                const [allTrips, allExperiences] = await Promise.all([
                    tripsApi.getAll(),
                    experiencesApi.getAll()
                ]);

                const tripsData = allTrips.data || allTrips || [];
                const experiencesData = allExperiences.data || allExperiences || [];

                const otherTrips = tripsData.filter(t => String(t._id) !== String(tripId));

                const affiliatedIds = new Set(
                    otherTrips.flatMap(trip => trip.experience_ids || []).map(String)
                );

                const unaffiliated = experiencesData.filter(
                    exp => !affiliatedIds.has(exp._id)
                );

                setAllExperiences(unaffiliated);
            } catch (err) {
                console.error("Failed to load experiences", err);
            } finally {
                setIsLoadingExperiences(false);
            }
        };

        fetchUserExperiences();
    }, []);

    const dropdownOptions = allExperiences.filter(
        exp => !formData.experience_ids.map(String).includes(String(exp._id))
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddCollaborator = async () => {
        const email = collaboratorInput.trim();

        if (!email) return;

        setIsLookingUpUser(true);
        setError(null);

        try {
            const res = await usersApi.getBatchByEmail({emails: [email]});
            const users = res.data || res || [];
            const foundUser = users[0];

            if (!foundUser || !foundUser._id) {
                setError("No user found with this email address.");
                return;
            }

            const userId = String(foundUser._id);

            if (formData.collaborator_ids.map(String).includes(userId)) {
                setError("This user is already a collaborator.");
                return;
            }

            setFormData((prev) => ({
                ...prev,
                collaborator_ids: [...prev.collaborator_ids, userId]
            }));

            setCollaboratorMap((prev) => ({
                ...prev,
                [userId]: foundUser.email || email
            }));

            setCollaboratorInput("");
        } catch (err) {
            setError(err.message || "Failed to find user with that email.")
        } finally {
            setIsLookingUpUser(false);
        }
    };

    const handleRemoveCollaborator = (emailToRemove) => {
        setFormData((prev) => ({
            ...prev,
            collaborator_ids: prev.collaborator_ids.filter((item) => item !== emailToRemove)
        }));
    };

    const handleAddExperiences = () => {
        if (!selectedExperienceId) return;

        if (formData.experience_ids.includes(selectedExperienceId)) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            experience_ids: [...prev.experience_ids, selectedExperienceId]
        }));

        setSelectedExperienceId("");
    }

    const handleRemoveExperience = (expIdToRemove) => {
        setFormData((prev) => ({
            ...prev,
            experience_ids: prev.experience_ids.filter((id) => id !== expIdToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const updatedFields = {}

        const isArrayEqual = (arr1=[], arr2=[]) => {
            if (arr1.length !== arr2.length) return false;
            return arr1.every((val, index) => val === arr2[index]);
        }

        Object.keys(formData).forEach((key) => {
            if (Array.isArray(formData[key])) {
                if (!isArrayEqual(formData[key], trip?.[key] || [])) {
                    updatedFields[key] = formData[key];
                }
            }
            else if (formData[key] !== trip?.[key]) {
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
                            placeholder="Add by email..."
                            value={collaboratorInput}
                            onChange={(e) => setCollaboratorInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCollaborator();
                                }
                            }}
                        />
                        <button type="button" className="inline-add-btn" onClick={handleAddCollaborator} disabled={isLookingUpUser || !collaboratorInput.trim()}>{isLookingUpUser ? "searching..." : "Add"}</button>
                    </div>
                    <div className="tags-container">
                        {formData.collaborator_ids.length > 0 ? (
                            formData.collaborator_ids.map((id) => (
                                <span key={id} className="tag-chip">{collaboratorMap[id] || id}<button type="button" className="remove-tag" onClick={() => handleRemoveCollaborator(id)}>&times;</button></span>
                            ))
                        ) : (
                            <span className="tag-chip" style={{ background: "#eee", color: "#666" }}>No collaborators added yet</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trip-experiences">Experiences: </label>
                    <div className="input-with-button-row">
                        <select id="trip-experiences" value={selectedExperienceId} onChange={(e) => setSelectedExperienceId(e.target.value)} disabled={isLoadingExperiences}>
                            <option value="" disabled>
                                {isLoadingExperiences
                                    ? "Loading experiences..."
                                    : "Select an unaffiliated experience to add..."
                                }
                            </option>
                            {dropdownOptions.map(exp => (
                                <option key={exp._id} value={exp._id}>{exp.title}</option>
                            ))}
                        </select>
                        <button 
                            type="button" 
                            className="inline-add-btn" 
                            onClick={handleAddExperiences} 
                            disabled={!selectedExperienceId}
                        >
                            Add
                        </button>
                    </div>
                    <div className="tags-container">
                        {formData.experience_ids.length > 0 ? (
                            formData.experience_ids.map(id => {
                                const match = allExperiences.find(e => String(e._id) === String(id));
                                return (
                                    <span key={id} className="tag-chip">{match ? match.title : id}<button type="button" className="remove-tag" onClick={() => handleRemoveExperience(id)}>&times;</button></span>
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
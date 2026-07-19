import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tripsApi, experiencesApi, usersApi } from "../../services/api";
import "../../styles/Experiences.css";

export const ExperienceCard = ( { experience, currentUser, onExperienceDeleted } ) => {
    const navigate = useNavigate();

    const [userTrips, setUserTrips] = useState([]);
    const [associatedTrip, setAssociatedTrip] = useState(null);
    const [selectedTripId, setSelectedTripId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAndCheckUserTrips = async () => {
            if (!currentUser) return;

            try {
                const response = await tripsApi.getAll();
                const trips = response;
                setUserTrips(trips);

                const matchedTrip = trips.find(trip => trip.experience_ids && trip.experience_ids.includes(experience._id));

                if (matchedTrip) setAssociatedTrip(matchedTrip);
            } catch (err) {
                console.error("Failed to load trips for affiliation check: ", err);
            }
        }

        fetchAndCheckUserTrips();
    }, [experience._id, currentUser]);

    const handleAddToTrip = async (e) => {
        e.stopPropagation();
        if (!selectedTripId) return alert("Please select a trip first.");

        setLoading(true);
        try {
            await tripsApi.addExperienceToTrip(selectedTripId, experience._id);

            const targetTrip = userTrips.find(t => t._id === selectedTripId);
            setAssociatedTrip(targetTrip);
            setSelectedTripId("");
        } catch (err) {
            alert(`Failed to add to trip: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    const handleRemoveFromTrip = async (e) => {
        e.stopPropagation();
        if (!associatedTrip) return;

        if (window.confirm(`Remove this experience from "${associatedTrip.title}"?`)) {
            setLoading(true);
            try {
                await tripsApi.removeExperienceFromTrip(associatedTrip._id, experience._id);
                setAssociatedTrip(null);
            } catch (err) {
                alert(`Failed to remove from trip: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/edit-experience/${experience._id}`, { state: { experience } });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this experience?")) {
            try {
                await experiencesApi.remove(experience._id);
                if (onExperienceDeleted) {
                    onExperienceDeleted(experience._id);
                }
            } catch (err) {
                alert(`Failed to delete experience: ${err.message}`);
            }
        }
    };

    const handleViewSingleExperience = () => {
        navigate(`/single-experience/${experience._id}`);
    };
    
    return(
        <div className="experience-card">
            <div className="experience-actions">
                <button className="action-btn edit-btn" onClick={handleEdit} title="Edit Experience">
                    ✏️
                </button>
                <button className="action-btn delete-btn" onClick={handleDelete} title="Delete Experience">
                    🗑️
                </button>
            </div>
            <p className="experience-title">{experience.title}</p>
            <p className="experience-attr">{experience.description}</p>
            <p className="experience-attr">Location: {experience.location_name} </p>
            <p className="experience-attr">Keywords: {experience.keywords}</p>
            <p className="experience-attr">Average rating: 
                {experience.ratings.length === 0 ? "N/A"
                   : (experience.ratings.reduce((acc, currVal) => acc + currVal, 0)) / experience.ratings.length}
                </p>
            <button className="full-details-button-link" onClick={handleViewSingleExperience}>
                View Full Details
            </button>
            <div className="affiliated-trip-container" onClick={(e) => e.stopPropagation()}>
                {associatedTrip ? (
                    <div className="affiliated-trip-container">
                        <p className="trip-status">Trip: {associatedTrip.trip_name}</p>
                        <button 
                            className="trip-action-btn remove-btn"
                            onClick={handleRemoveFromTrip}
                            disabled={loading}
                        >
                            {loading ? "Removing..." : "Remove experience from this trip?"}
                        </button>
                    </div>
                ) : (
                    <div className="unaffiliated-trip-container">
                        <select
                            value={selectedTripId}
                            onChange={(e) => setSelectedTripId(e.target.value)}
                            className="trip-dropdown"
                            disabled={loading}
                        >
                            <option value="">Add to a trip</option>
                            {userTrips.map(trip => (
                                <option key={trip._id} value={trip._id}>
                                    {trip.trip_name}
                                </option>
                            ))}
                        </select>

                        {selectedTripId && (
                            <button
                                className="trip-action-btn add-btn"
                                onClick={handleAddToTrip}
                                disabled={loading}
                            >
                                {loading ? "adding..." : "Add experience to this trip?"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
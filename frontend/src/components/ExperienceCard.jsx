// Citations:
// Got some help from Gemini regarding star ratings for experiences of non-owners. 
// This transcript https://gemini.google.com/app/2d919459a5d07775
// documents the Gen AI interaction that led to the generation of this code. 

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tripsApi, experiencesApi, usersApi } from "../services/api";
import "../styles/Experiences.css";

export const ExperienceCard = ( { experience, currentUser, onExperienceDeleted, isSearchPage=false } ) => {
    const navigate = useNavigate();

    const [userTrips, setUserTrips] = useState([]);
    const [associatedTrip, setAssociatedTrip] = useState(null);
    const [selectedTripId, setSelectedTripId] = useState("");
    const [loading, setLoading] = useState(false);

    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [ratings, setRatings] = useState(experience.ratings || []);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const experienceUserId = experience.user_id;
    const isOwner = currentUser && currentUser._id === experienceUserId;

    useEffect(() => {
        setRatings(experience.ratings || []);
    }, [experience.ratings]);

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

    const handleRate = async (stars) => {
        if (!currentUser) return alert("Please log in to rate experiences.");
        if (isOwner) return alert("Please rate your own experiences via the edit form.");

        setIsSubmittingRating(true);
        try {
            const res = await experiencesApi.rate(experience._id, stars);
            setRating(stars);

            if (res && Array.isArray(res.ratings)) {
                setRatings(res.ratings);
            } else {
                setRatings(prevRatings => [...prevRatings, stars]);
            }
        } catch (err) {
            alert(`Failed to submit rating: ${err.message}`);
        } finally {
            setIsSubmittingRating(false);
        }
    }

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

        if (window.confirm(`Remove this experience from "${associatedTrip.trip_name}"?`)) {
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
        onExperienceDeleted(experience._id);
    };

    const handleViewSingleExperience = () => {
        navigate(`/single-experience/${experience._id}`);
    };

    const displayAverageRating = ratings.length > 0
        ? parseFloat((ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(2))
        : "N/A";
    
    const formattedKeywords = experience.keywords && experience.keywords.length > 0
        ? experience.keywords.join(", ")
        : "N/A";

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
            <p className="experience-attr">Description: {experience.description === null ? "N/A" : experience.description}</p>
            <p className="experience-attr">Location: {experience.location_name} </p>
            <p className="experience-attr">Keywords: {formattedKeywords}</p>
            <p className="experience-attr">Average rating: {displayAverageRating}</p>

            {isSearchPage && currentUser && !isOwner && (
                <div className="card-rating-group" onClick={(e) => e.stopPropagation()}>
                    <label className="card-rating-label">Rate this experience:</label>
                    <div className="star-rating card-star-rating">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                            <span
                                key={starValue}
                                className={`star ${(hoveredRating || rating) >= starValue ? "active" : ""} ${isSubmittingRating ? "disabled" : ""}`}
                                onClick={() => !isSubmittingRating && handleRate(starValue)}
                                onMouseEnter={() => !isSubmittingRating && setHoveredRating(starValue)}
                                onMouseLeave={() => !isSubmittingRating && setHoveredRating(0)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
            )}

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
                            {loading ? "Removing..." : "Remove from trip"}
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
                                {loading ? "adding..." : "Add to trip"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
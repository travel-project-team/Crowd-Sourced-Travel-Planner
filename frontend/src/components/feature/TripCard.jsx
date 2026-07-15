import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tripsApi, experiencesApi, usersApi } from "../../services/api";
import "../../styles/Trips.css";

export const TripCard = ( { trip, currentUser, onTripDeleted } ) => {
    // Get actual collaborators when you have a get users by ID route. 
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredExperiences, setFilteredExperiences] = useState([]);

    useEffect(() => {
        if (!isDropdownOpen) return;

        // Refactor this to the batch of Ids endpoint eventually. 
        const fetchAndFilterExperiences = async () => {
            try {
                const allExperiences = await experiencesApi.getAll();

                const tripExpIds = trip.experience_ids || [];
                const matched = allExperiences.filter(exp => tripExpIds.includes(exp._id));

                setFilteredExperiences(matched);
            } catch (err) {
                console.error("Failed to fetch experiences for trip:", trip._id, err);
            }
        }

        fetchAndFilterExperiences();
    },[isDropdownOpen, trip.experience_ids, trip._id]);

    const ownerName = trip.owner_id === currentUser?._id
        ? `${currentUser.first_name} ${currentUser.last_name}`
        : `User (${trip.owner_id})`;

    const collaboratorNames = trip.collaborator_ids?.length > 0
        ? trip.collaborator_ids.join(", ")
        : "None"

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/edit-trip/${trip._id}`, { state: { trip } });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                await tripsApi.remove(trip._id);
                if (onTripDeleted) {
                    onTripDeleted(trip._id);
                }
            } catch (err) {
                alert(`Failed to delete trip: ${err.message}`);
            }
        }
    };
    
    return(
        <div className="trip-card">
            <div className="trip-actions">
                <button className="action-btn edit-btn" onClick={handleEdit} title="Edit Trip">
                    ✏️
                </button>
                <button className="action-btn delete-btn" onClick={handleDelete} title="Delete Trip">
                    🗑️
                </button>
            </div>
            <p className="trip-title">{trip.trip_name}</p>
            <p className="trip-attr">{trip.trip_description}</p>
            <p className="trip-attr">Owner: {ownerName} </p>
            <p className="trip-attr">Collaborators: {collaboratorNames}</p>
            <div className="trip-experiences-dropdown">
                <button 
                    className="dropdown-toggle" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                >
                    Experiences
                    <span className={`arrow ${isDropdownOpen ? "open": ""}`}>▶</span>
                </button>

                {isDropdownOpen && (
                    <ul className="dropdown-menu">
                        {filteredExperiences.length > 0 ? (
                            filteredExperiences.map(exp => (
                                <li key={exp._id} className="dropdown-item">
                                    <Link
                                        to={`/single-experience/${exp._id}`}
                                        state={{ experience: exp }}
                                        className="dropdown-button-link"
                                    >
                                        {exp.title}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="dropdown-item-no-exp">No experiences available (yet)</li>
                        )}
                    </ul>
                )}

            </div>
        </div>
    )
}
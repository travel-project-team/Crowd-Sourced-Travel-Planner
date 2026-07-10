import { useState } from "react";
import { Link } from "react-router-dom";
import DummyData from "../../DummyData.jsx";
import "../../styles/Trips.css";

export const TripCard = ( {trip} ) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const owner = DummyData.users.find(user => user._id === trip.owner_id);

    const collaborators = trip.collaborator_ids
        .map(id => DummyData.users.find(user => user._id === id))
        .filter(Boolean)
        .map(user => `${user.first_name} ${user.last_name}`)
        .join(", ");
    
    const experiences = trip.experience_ids
        ? trip.experience_ids.map(id => DummyData.experiences.find(exp => exp._id === id)).filter(Boolean)
        : [];
    
    return(
        <div className="trip-card">
            <p className="trip-title">{trip.trip_name}</p>
            <p className="trip-attr">{trip.trip_description}</p>
            <p className="trip-attr">Owner: {owner.first_name} {owner.last_name}</p>
            <p className="trip-attr">Collaborators: {collaborators}</p>
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
                        {experiences.length > 0 ? (
                            experiences.map(exp => (
                                <li key={exp._id} className="dropdown-item">
                                    <Link
                                        to={`/experience/${exp._id}`}
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
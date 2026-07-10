import { useState } from "react";
import DummyData from "../../DummyData.jsx";
import "../../styles/Trips.css";

export const TripCard = ( {trip} ) => {
    const [isOpen, setIsOpen] = useState(false);

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
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                >
                    Experiences
                    <span className={`arrow ${isOpen ? "open": ""}`}>▶</span>
                </button>

                {isOpen && (
                    <ul className="dropdown-menu">
                        {experiences.length > 0 ? (
                            experiences.map(exp => (
                                <li key={exp._id} className="dropdown-item">
                                    {exp.title}
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
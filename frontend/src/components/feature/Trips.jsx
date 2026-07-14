import { tripsApi, usersApi } from "../../services/api.js";
import { TripCard } from "./TripCard.jsx";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/Trips.css";

export const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tripData, userData] = await Promise.all([
                    tripsApi.getAll(), // Refactor to All Trips by Owner
                    usersApi.getProfile() // Gets currentUser
                ]);

                setTrips(tripData);
                setCurrentUser(userData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    },[]);

    if (loading) return <div className="trips-container"><p>Loading your trips...</p></div>;
    if (error) return <div className="trips-container"><p>Error: {error}</p></div>;

    return (
        <div className="trips-container">
            <h2 className="trips-heading">Your Trips</h2>
            <div className="trips-body">
                {trips.length === 0 ? (
                    <p>No trips found. Time to plan a new one...</p>
                ) : (
                    trips.map((trip) => (
                        <TripCard 
                            key={trip._id} 
                            trip={trip} 
                            currentUser={currentUser}
                            onTripDeleted={(id) => setTrips(prev => prev.filter(t => t.id !== id))}
                        />
                    ))
                )}
            </div> 
            <div>
                <Link to="/add-trip" className="add-button">
                    Add trip
                </Link>
                <Link to="/add-experience" className="add-button">
                    Add experience
                </Link>
            </div>
        </div>
    );
}
// Citations:
// Some bug fixes were implemented with the assistance of Gemini.
// This transcript https://gemini.google.com/app/c4ffb4e81781dabe
// documents the Gen AI interaction that led to the generation of this code. 

import { tripsApi } from "../services/api.js";
import { TripCard } from "../components/TripCard.jsx";
import { Link, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Trips.css";

export const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useOutletContext();

    useEffect(() => {
        const loadData = async () => {
            try {
                const tripData = await tripsApi.getAll();

                setTrips(tripData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    },[]);

    // Delete: calls the API and updates state
    const handleDeleteTrip = async (tripId) => {
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                await tripsApi.remove(tripId);
                setTrips(prev => prev.filter(t => t._id !== tripId));
            } catch (err) {
                alert(`Failed to delete trip: ${err.message}`);
            }
        }
    };

    if (loading) return <div className="trips-container"><p>Loading your trips...</p></div>;
    if (error) return <div className="trips-container"><p>Error: {error}</p></div>;

    return (
        <div className="trips-container">
            <h2 className="trips-heading">Your Trips</h2>
            <div>
                <Link to="/add-trip" className="add-button">
                    Add trip
                </Link>
                <Link to="/add-experience" className="add-button">
                    Add experience
                </Link>
            </div>
            <div className="trips-body">
                {trips.length === 0 ? (
                    <p>No trips found. Time to plan a new one...</p>
                ) : (
                    trips.map((trip) => (
                        <TripCard
                            key={trip._id}
                            trip={trip}
                            currentUser={user}
                            onTripDeleted={handleDeleteTrip}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
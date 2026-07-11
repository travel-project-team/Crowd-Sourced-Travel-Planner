import DummyData from "../../DummyData.jsx";
import { TripCard } from "./TripCard.jsx";
import { Link } from "react-router-dom";
import "../../styles/Trips.css";

export const Trips = () => {
    return (
        <div className="trips-container">
            <h2 className="trips-heading">Your Trips</h2>
            <div className="trips-body">
                {DummyData.trips.map((trip) => (
                    <TripCard key={trip._id} trip={trip} />
                ))}
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
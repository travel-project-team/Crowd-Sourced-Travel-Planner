import DummyData from "../../DummyData.jsx";
import { TripCard } from "./TripCard.jsx";
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
                <button>Add trip</button>
                <button>Add experience</button>  
            </div>
        </div>
    );
}
import DummyData from "../../DummyData.jsx";
import "../../styles/Trips.css";

export const Trips = () => {
    return (
        <div className="trips-container">
            <h2 className="trips-heading">Your Trips</h2>
            <div className="trips-body">
                {DummyData.trips.map((trip) => (
                    <div key={trip._id} className="trip-card">
                        <p className="trip-title">{trip.trip_name}</p>
                        <p className="trip-attr">{trip.trip_description}</p>
                        <p className="trip-attr">
                            Owner: {DummyData.users.find(user => user._id === trip.owner_id)?.first_name} {" "}
                            {DummyData.users.find(user => user._id === trip.owner_id)?.last_name}
                        </p>
                         <p className="trip-attr">
                            Collaborators: 
                            {trip.collaborator_ids.map(id => DummyData.users.find(user => user._id === id))
                            .filter(Boolean).map(user => `${user.first_name} ${user.last_name}`).join(", ")}
                        </p>
                    </div>
                ))}
            </div>   
        </div>
    );
}
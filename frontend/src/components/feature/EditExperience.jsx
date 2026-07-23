// Citation: AI enhanced formatting with Gemini.

import "../../styles/EditForms.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tripsApi, experiencesApi } from "../../services/api.js";

export const EditExperience = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { experience } = location.state || {};

    const [title, setTitle] = useState(experience?.title || "");
    const [description, setDescription] = useState(experience?.description || "");
    const [locationName, setLocationName] = useState(experience?.location_name || "");
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    const [keywordInput, setKeywordInput] = useState("");
    const [keywords, setKeywords] = useState(experience?.keywords || []);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(experience?.image_url || "");

    const [userTrips, setUserTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState(experience?.trip_id || "no-trip");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const trips = await tripsApi.getAll();
                setUserTrips(trips);
            } catch (err) {
                console.error("Failed to fetch trips: ", err);
            }
        };
        fetchTrips();
    },[]);

    useEffect(() => {
        if (userTrips.length > 0 && experience) {
            const expId = experience._id || experience.id;
            const matchingTrip = userTrips.find((trip) =>
                trip.experience_ids?.includes(expId)
            );
            if (matchingTrip) {
                setSelectedTripId(matchingTrip._id || matchingTrip.id);
            }
        }
    }, [userTrips, experience]);

    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim().toLowerCase();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords((prev) => [...prev, trimmed]);
            setKeywordInput("");
        }
    }

    const handleRemoveKeyword = (tagToRemove) => {
        setKeywords((prev) => prev.filter((tag) => tag !== tagToRemove));
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting || !experience) return;
        setIsSubmitting(true);

        try {
            let finalImageUrl = currentImageUrl;

            if (selectedFile) {
                const fileData = new FormData();
                fileData.append("file", selectedFile);

                const uploadResult = await experiencesApi.uploadImage(fileData);
                finalImageUrl = uploadResult.image_url;
            }

            let locationGeoJson = experience.location_geojson || null;
            if (locationName !== experience.location_name) {
                try {
                    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
                    const geoResponse = await fetch(geocodeUrl, {
                        headers: {
                            "User-Agent": "TravelAppExperienceLogger/1.0"
                        }
                    });

                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        if (geoData && geoData.length > 0) {
                            locationGeoJson = {
                                type: "Point",
                                coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)]
                            };
                        }
                    }
                } catch (geoErr) {
                    console.warn("Geocoding lookup failed: ", geoErr);
                }
            }

            const currentTrip = userTrips.find((trip) => {
                trip.experience_ids?.includes(experience._id);
            });

            const currentTripId = currentTrip ? (currentTrip._id || currentTrip.id) : "no-trip";

            if (selectedTripId !== currentTripId) {
                if (currentTripId !== "no-trip") {
                    await tripsApi.removeExperienceFromTrip(currentTripId, experience._id);
                }

                if (selectedTripId && selectedTripId !== "no-trip") {
                    await tripsApi.addExperienceToTrip(selectedTripId, experience._id);
                }
            }

            const currentRatings = experience?.ratings ? [...experience.ratings] : [];

            if (rating > 0) {
                currentRatings.push(rating);
            }

            const updatedPayload = {
                title,
                description: description || null,
                location_name: locationName,
                location_geojson: locationGeoJson,
                keywords,
                image_url: finalImageUrl,
                ratings: currentRatings
            };

            await experiencesApi.update(experience._id, updatedPayload);

            alert("experience updated successfully!");
            navigate(-1);
        } catch (err) {
            console.error("Failed to update experience: ", err);
            alert(`Error updating experience: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!experience) {
        return(
            <div className="edit-container">
                <p>No data found. Please return to prior page.</p>
                <button className="back-button" onClick={() => navigate(-1)}>Back</button>
            </div>
        )
    }

    return (
        <div className="edit-container">
            <h2 className="edit-heading">Update Your Experience</h2>
            <form className="edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="experience-name">Experience Title:</label>
                    <input type="text" id="experience-name" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="experience-description">Description:</label>
                    <textarea id="experience-description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>    

                <div className="form-group">
                    <label htmlFor="experience-location">Location:</label>
                    <input type="text" id="experience-location" value={locationName} onChange={(e) => setLocationName(e.target.value)} required />
                </div>  

                <div className="form-group">
                    <label htmlFor="experience-keywords">Keywords</label>
                    <div className="input-with-button-row">
                        <input 
                            type="text"
                            id="experience-keywords"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddKeyword();
                                }
                            }}
                        />
                        <button type="button" className="inline-add-btn" onClick={handleAddKeyword}>Add</button>
                    </div>
                    <div className="tags-container">
                        {keywords.map((tag) => (
                            <span key={tag} className="tag-chip">
                                {tag}
                                <button type="button" className="remove-tag" onClick={() => handleRemoveKeyword(tag)}>
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Your Rating:</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                            <span 
                                key={starValue} 
                                className={`star ${(hoveredRating || rating) >= starValue ? "active" : ""}`}
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoveredRating(starValue)}
                                onMouseLeave={() => setHoveredRating(0)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="experience-image">Replace or Add Image:</label>
                    <input 
                        type="file" 
                        id="experience-image" 
                        onChange={handleFileChange}
                        accept="image/*"
                        className="file-input"
                    />
                    {(selectedFile || currentImageUrl) && (
                        <div className="image-preview-container" style={{ marginTop: "10px" }}>
                            <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px" }}>
                                {selectedFile ? "New file selected:" : "Current image:"}
                            </p>
                            <img 
                                src={selectedFile ? URL.createObjectURL(selectedFile) : currentImageUrl} 
                                alt="Experience preview" 
                                style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "8px", objectFit: "cover" }}
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="trip-affiliation">Which of your Trips was this a part of?: </label>
                    <div className="input-with-button-row">
                        <select id="trip-affiliation" value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)}>
                            <option value="no-trip">No Trip</option>
                            {userTrips.map((trip) => (
                                <option key={trip._id || trip.id} value={trip._id || trip.id}>
                                    {trip.trip_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>Update Experience</button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        </div>
    )
}
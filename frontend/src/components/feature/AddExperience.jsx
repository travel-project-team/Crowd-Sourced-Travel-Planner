// Citation: AI enhanced formatting with Gemini.

import "../../styles/AddForms.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { tripsApi, experiencesApi, usersApi } from "../../services/api.js";

export const AddExperience = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [locationName, setLocationName] = useState("");
    const [rating, setRating] = useState(0);
    const [selectedTripId, setSelectedTripId] = useState("");

    const [keywordInput, setKeywordInput] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const [userTrips, setUserTrips] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const trips = await tripsApi.getAll();
                setUserTrips(trips);
            } catch (err) {
                console.error("Failed to fetch available trips for association: ", err);
            }
        };
        fetchTrips();
    },[])

    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim().toLowerCase();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords([...keywords, trimmed]);
            setKeywordInput("");
        }
    };

    const handleRemoveKeyword = (tagToRemove) => {
        setKeywords(keywords.filter(tag => tag !== tagToRemove));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let uploadedImageUrl = null;

            if (selectedFile) {
                const fileData = new FormData();
                fileData.append("file", selectedFile);

                const uploadResult = await experiencesApi.uploadImage(fileData);
                uploadedImageUrl = uploadResult.image_url;
            }

            let locationGeoJson = null;
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
                        const lon = parseFloat(geoData[0].lon);
                        const lat = parseFloat(geoData[0].lat);

                        locationGeoJson = {
                            type: "Point",
                            coordinates: [lon, lat]
                        };
                    }
                }
            } catch (geoErr) {
                console.warn("Geocoding lookup failed: ", geoErr);
            }

            const experiencePayload = {
                title: title,
                description: description || null,
                location_name: locationName,
                location_geojson: locationGeoJson,
                keywords: keywords,
                image_url: uploadedImageUrl,
                ratings: rating > 0 ? [rating] : []
            };

            const response = await experiencesApi.create(experiencePayload);
            const newExperienceId = response.id;

            if (selectedTripId && selectedTripId !== "no-trip" && newExperienceId) {
                await tripsApi.addExperienceToTrip(selectedTripId, newExperienceId);
            }

            alert("Experience added successfully!");
            navigate(-1);
        } catch (err) {
            console.error("Failed to save experience: ", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="add-container">
            <h2 className="add-heading">Add a New Experience</h2>
            <form className="add-form" onSubmit={handleSubmit}>
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
                            placeholder="Add keywords to help others can find your experience!"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); } }}
                        />
                        <button type="button" className="inline-add-btn" onClick={handleAddKeyword}>Add</button>
                    </div>
                    <div className="tags-container">
                        {keywords.map(tag => (
                            <span key={tag} className="tag-chip">
                                {tag}
                                <button type="button" className="remove-tag" onClick={() => handleRemoveKeyword(tag)}>&times;</button>
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
                    <label htmlFor="experience-image">Upload Image:</label>
                    <input 
                        type="file" 
                        id="experience-image" 
                        name="experience-image" 
                        accept="image/*"
                        className="file-input"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="trip-affiliation">Which of your Trips was this a part of?: </label>
                    <div className="input-with-button-row">
                        <select id="trip-affiliation" value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)}>
                            <option value="no-trip">No Trip</option>
                            {userTrips.map(trip => (
                                <option key={trip._id} value={trip._id}>{trip.trip_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="submit" className="submit-button">
                    {isSubmitting ? "Adding experience..." : "Add Experience"}
                </button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        </div>
    )
}
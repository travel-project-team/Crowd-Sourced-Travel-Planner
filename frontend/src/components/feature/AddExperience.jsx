// Citation: AI enhanced formatting with Gemini.

import "../../styles/AddForms.css";
import { useLocation, useNavigate } from "react-router-dom";

export const AddExperience = () => {

    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="add-container">
            <h2 className="add-heading">Add a New Experience</h2>
            <form className="add-form">
                <div className="form-group">
                    <label htmlFor="experience-name">Experience Title:</label>
                    <input type="text" id="experience-name" name="experience-name" required />
                </div>

                <div className="form-group">
                    <label htmlFor="experience-description">Description:</label>
                    <textarea id="experience-description" name="experience-description"></textarea>
                </div>    
                
                <div className="form-group">
                    <label htmlFor="experience-location">Location:</label>
                    <textarea id="experience-location" name="experience-location"></textarea>
                </div>   

                <div className="form-group">
                    <label htmlFor="experience-keywords">Keywords</label>
                    <div className="input-with-button-row">
                        <input 
                            type="text"
                            id="experience-keywords"
                            placeholder="Add keywords to help others can find your experience!"
                        />
                        <button type="button" className="inline-add-btn">Add</button>
                    </div>
                    <div className="tags-container">
                        <span className="tag-chip">Boating<button type="button" className="remove-tag">&times;</button></span>
                        <span className="tag-chip">Dancing<button type="button" className="remove-tag">&times;</button></span>
                    </div>
                </div>

                <div className="form-group">
                    <label>Your Rating:</label>
                    <div className="star-rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
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
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="trip-affiliation">Which of your Trips was this a part of?: </label>
                    <div className="input-with-button-row">
                        <select id="trip-affiliation" defaultValue="">
                            <option value="trip-1">Paris</option>
                            <option value="trip-2">Hong Kong</option>
                            <option value="trip-3">Portland</option>
                            <option value="no-trip" select>None</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="submit-button">Add Experience</button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        </div>
    )
}
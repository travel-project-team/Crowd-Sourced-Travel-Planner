// Citation: AI enhanced formatting with Gemini.

import "../../styles/AddForms.css";
import { useLocation, useNavigate } from "react-router-dom";

export const AddTrip = () => {

    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="add-container">
            <h2 className="add-heading">Add a New Trip</h2>
            <form className="add-form">
                <div className="form-group">
                    <label htmlFor="trip-name">Trip Name:</label>
                    <input type="text" id="trip-name" name="trip-name" required />
                </div>

                <div className="form-group">
                    <label htmlFor="trip-description">Description:</label>
                    <textarea id="trip-description" name="trip-description"></textarea>
                </div>    

                <div className="form-group">
                    <label htmlFor="trip-collaborators">Collaborators</label>
                    <div className="input-with-button-row">
                        <input 
                            type="email"
                            id="trip-collaborators"
                            placeholder="Add by email."
                        />
                        <button type="button" className="inline-add-btn">Add</button>
                    </div>
                    <div className="tags-container">
                        <span className="tag-chip">jim@expample.org<button type="button" className="remove-tag">&times;</button></span>
                        <span className="tag-chip">john@expample.org<button type="button" className="remove-tag">&times;</button></span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trip-experiences">Experiences: </label>
                    <div className="input-with-button-row">
                        <select id="trip-experiences" defaultValue="">
                            <option value="" disabled select>Select from your unaffiliated experiences to add to this trip...</option>
                            <option value="exp-1">Scuba Diving</option>
                            <option value="exp-2">Eiffel Tower</option>
                        </select>
                        <button type="button" className="inline-add-btn">Add</button>
                    </div>
                    <div className="tag-container">
                        <span className="tag-chip">Scuba Diving<button type="button" className="remove-tag">&times;</button></span>
                    </div>
                </div>

                <button type="submit" className="submit-button">Add Trip</button>
            </form>

            <button className="back-button" onClick={() => navigate(-1)}>Back to trips</button>
        </div>
    )
}
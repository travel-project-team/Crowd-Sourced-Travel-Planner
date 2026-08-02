import { experiencesApi, usersApi } from "../services/api.js";
import { ExperienceCard } from "../components/ExperienceCard.jsx";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Experiences.css";

export const SearchPage = () => {
    const [experiences, setExperiences] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("keyword");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const { user } = useOutletContext();

    // Fetch experiences from backend
    const fetchExperiences = async (term, type=searchType) => {
        setLoading(true);
        setError(null);

        try {
            const queryParam = term ? { [type]: term } : {};
            const results = await experiencesApi.search(queryParam);
            setExperiences(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show all experiences by default on page load
    useEffect(() => {
        fetchExperiences("", searchType);
    }, []);

    // Submit button calls backend and refreshes results
    const handleSubmit = (e) => {
        e.preventDefault();
        setHasSearched(true);
        fetchExperiences(searchTerm.trim(), searchType);
    };

    // Reset to the default view (all experiences)
    const handleClear = () => {
        setSearchTerm("");
        setHasSearched(false);
        fetchExperiences("", searchType);
    };

    // Delete: calls the API and updates state 
    const handleDeleteExperience = async (experienceId) => {
        if (window.confirm("Are you sure you want to delete this Experience?")) {
            try {
                await experiencesApi.remove(experienceId);
                setExperiences(prev => prev.filter(e => e._id !== experienceId));
            } catch (err) {
                alert(`Failed to delete experience: ${err.message}`);
            }
        }
    };

    return (
        <div className="experiences-container">
            <h2 className="experiences-heading">Search Experiences</h2>
            <p className="form-helper">Search for experiences by keyword or location!</p>

            <form className="search-bar" onSubmit={handleSubmit}>
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    aria-label="Select search type"
                >
                    <option value="keyword">Keyword</option>
                    <option value="location">Location</option>
                </select>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search experiences"
                />
                <button type="submit">Search</button>
                {hasSearched && (
                    <button type="button" onClick={handleClear}>
                        Show all
                    </button>
                )}
            </form>

            {loading && <p>Loading experiences...</p>}
            {error && <p>Error: {error}</p>}

            {!loading && !error && (
                <div className="experiences-body">
                    {experiences.length === 0 ? (
                        <p>
                            {hasSearched
                                ? "No experiences matched your search."
                                : "No experiences found."}
                        </p>
                    ) : (
                        experiences.map((experience) => (
                            <ExperienceCard
                                key={experience._id}
                                experience={experience}
                                currentUser={user}
                                onExperienceDeleted={handleDeleteExperience}
                                isSearchPage={true}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

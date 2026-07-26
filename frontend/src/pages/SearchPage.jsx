import { experiencesApi, usersApi } from "../services/api.js";
import { ExperienceCard } from "../components/ExperienceCard.jsx";
import { useState, useEffect } from "react";
import "../styles/Experiences.css";

export const SearchPage = () => {
    const [experiences, setExperiences] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch experiences from backend
    const fetchExperiences = async (searchTerm) => {
        setLoading(true);
        setError(null);

        try {
            const results = await experiencesApi.search(
                searchTerm ? { keyword: searchTerm } : {}
            );
            setExperiences(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show all experiences by default on page load
    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await usersApi.getProfile();
                setCurrentUser(userData);
            } catch (err) {
                console.error("Failed to load user profile: ", err);
            }

            fetchExperiences("");
        };

        loadData();
    }, []);

    // Submit button calls backend and refreshes results
    const handleSubmit = (e) => {
        e.preventDefault();
        setHasSearched(true);
        fetchExperiences(keyword.trim());
    };

    // Reset to the default view (all experiences)
    const handleClear = () => {
        setKeyword("");
        setHasSearched(false);
        fetchExperiences("");
    };

    return (
        <div className="experiences-container">
            <h2 className="experiences-heading">Search Experiences</h2>

            <form className="search-bar" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search by title, description, or keyword..."
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
                                currentUser={currentUser}
                                onExperienceDeleted={(id) =>
                                    setExperiences(prev => prev.filter(e => e._id !== id))
                                }
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

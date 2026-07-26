import { Link, useOutletContext } from "react-router-dom";
import discoverImg from "../assets/discover.jpg";
import tripsImg from "../assets/trips.jpg";
import shareImg from "../assets/share.jpg";
import "../styles/HomePage.css";

export const HomePage = () => {
    const { user } = useOutletContext();

    return (
        <div className="home-container">
            {/* Hero */}
            <section className="home-hero">
                <h1 className="home-title">Plan trips with experiences from real travelers</h1>
                <p className="home-subtitle">
                    Journey is built on experiences shared by the
                    community. Find something worth doing, add it to a trip, and share
                    your own favorites for other travelers to discover.
                </p>

                <div className="home-cta-row">
                    {user ? (
                        <>
                            <Link to="/search" className="home-cta primary">
                                Search experiences
                            </Link>
                            <Link to="/trips" className="home-cta secondary">
                                Your trips
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="home-cta primary">
                                Sign up
                            </Link>
                            <Link to="/login" className="home-cta secondary">
                                Log in
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {/* Feature highlights */}
            <section className="home-features">
                <div className="home-feature-card">
                    <img src={discoverImg} alt="Travelers exploring a destination" className="home-feature-img" />
                    <h3>Discover experiences</h3>
                    <p>
                        Browse and search experiences shared by other travelers, from
                        landmarks to hidden local spots.
                    </p>
                </div>
                <div className="home-feature-card">
                    <img src={tripsImg} alt="A planned travel route on a map" className="home-feature-img" />
                    <h3>Build your trips</h3>
                    <p>
                        Save experiences into trips you can organize, edit, and revisit
                        whenever you're ready to travel.
                    </p>
                </div>
                <div className="home-feature-card">
                    <img src={shareImg} alt="A traveler taking a photo to share" className="home-feature-img" />
                    <h3>Share your own</h3>
                    <p>
                        Add the experiences you'd recommend, with photos, locations, and
                        ratings, and help the community plan better trips.
                    </p>
                </div>
            </section>
        </div>
    );
}

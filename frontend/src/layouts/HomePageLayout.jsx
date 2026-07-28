// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { Outlet, useNavigate, useLocation  } from "react-router-dom"
import { useEffect, useState, useCallback} from "react";
import { usersApi } from "../services/api";
import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import "../styles/DashboardLayout.css"
export const HomePageLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize getProfile so it can be passed cleanly down context & used in effects
  const getProfile = useCallback(async () => {
    try {
      const data = await usersApi.getProfile();
      setUser(data);
    } catch (error) {
      console.error("Profile error", error);
      setUser(null); // Set user to null safely without forcing navigate()
    } finally {
      setIsLoading(false); // Mark initial check as done
    }
  }, []);

  // Run initial profile fetch on layout mount
  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Optional session sync effect (properly wrapped inside useEffect)
  useEffect(() => {
    // Only re-check if token exists or to re-validate session state on route changes
    const token = localStorage.getItem("token");
    if (token && !user) {
      getProfile();
    }
  }, [location.pathname, user, getProfile]);

  // Logout
  const logout = async () => {
    try {
      await usersApi.logout();
    } catch (error) {
      console.error("Logout encountered a problem:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/home", { replace: true }); // Wipe browser back-button history on logout
    }
  };

  // Delete User Profile
  const deleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      try {
        await usersApi.remove();
      } catch (err) {
        alert(`Failed to delete profile: ${err.message}`);
        throw err;
      } finally {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/home", { replace: true });
      }
    }
  };

  // 1. MANDATORY RENDER GATE: Keeps the DOM stable while network requests resolve
  if (isLoading) {
    return null; // Prevents Sidebar/Header from briefly rendering unauthenticated states
  }

  // 2. Stable execution block
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <div className="main-content-area">
        {user && <Header user={user} logout={logout} />}
        <main className="page-body">
          <Outlet context={{ user, getProfile, deleteProfile }} />
        </main>
      </div>
    </div>
  );
};
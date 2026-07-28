// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
// Used Google Gemini for routing optimization
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

// Get User profile
  const getProfile = useCallback(async () => {
    try {
      const data = await usersApi.getProfile();
      setUser(data);
    } catch (error) {
      console.error("Profile error", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    getProfile();
  }, [getProfile]);


  useEffect(() => {
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
      navigate("/home", { replace: true });
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

 // Prevent Sidebar from briefly rendering
  if (isLoading) {
    return null;
  }


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
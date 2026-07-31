// Citations:
// Rana, U. [Programming Fields]. (2026, February 6). Build Dashboard Layout in React
// | Sidebar + Header UI Using Tailwind CSS | React 19 - Ep 21 [Video]. YouTube.
// https://youtu.be/JVCU2qsGvOs?si=o27keYL5cTGeeNSu


import { Outlet, useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback} from "react";
import { usersApi } from "../services/api";
import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import "../styles/DashboardLayout.css"
export const HomePageLayout = () => {
  const navigate = useNavigate();
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
    if (!user) {
      getProfile();
    }
  }, [location.pathname, user, getProfile]);

  // Logout
  const logout = async () =>{
    try {
      await usersApi.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout encountered a problem:", error);
    } finally {
      navigate("/home");
    }
  }

    // Delete User Profile
  const deleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      try {
        await usersApi.remove();
        setUser(null);
        navigate("/home");

      } catch (err) {
        alert(`Failed to delete profile: ${err.message}`);
        throw err;
      }
    }
  }

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
// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { Outlet, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { usersApi } from "../services/api";
import { Header } from "../components/common/Header"
import { Sidebar } from "../components/common/Sidebar"
import "../styles/DashboardLayout.css"
export const HomePageLayout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try{
            const data = await usersApi.getProfile();
            setUser(data);

        }catch (error){
            console.error("Profile error", error);
            navigate("/home");
        }
    }

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
                navigate("/login");

            } catch (err) {
                alert(`Failed to delete profile: ${err.message}`);
                throw err;
            }
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar user={user}/>
            <div className="main-content-area">
                {user && <Header user={user} logout={logout}/>}
                <main className="page-body">
                    <Outlet context={{ user, getProfile, deleteProfile}}/>
                </main>

            </div>
        </div>
    )
}
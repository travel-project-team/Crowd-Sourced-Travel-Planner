// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { Outlet } from "react-router-dom"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../services/api";
import { authentication } from "../services/authentication";
import { Header } from "../components/common/Header"
import { Sidebar } from "../components/common/Sidebar"
import "../styles/DashboardLayout.css"
export const DashboardLayout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try{
            const data = await usersApi.getProfile();

            if (data) {
                setUser(data);
            }

        }catch (error){
            console.error("Profile error", error);
        }
    }

    // Logout
    const logout = async () =>{
        try {
            authentication.logout();
            localStorage.removeItem("access_token");
            localStorage.clear();
            sessionStorage.clear();
        } catch (error) {
            console.error("Logout encountered a problem:", error);
        } finally {
            window.location.href = "/login";
        }
    }


    return (
        <div className="dashboard-layout">
            <Sidebar/>
            <div className="main-content-area">
                <Header user={user} logout={logout}/>
                <main className="page-body">
                    <Outlet context={{ user }}/>
                </main>
            </div>
        </div>
    )
}
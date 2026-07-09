// citation: https://youtu.be/VeUz9i6MtFg?si=AoWUkrYKOWnh8m1H
import { useEffect, useState } from "react";

export const Dashboard = ({setPage}) =>{
    const [user, setUser] = useState(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const token = localStorage.getItem("token");
        try{
            const response = await fetch("http://localhost:8000/api/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            // bad token
            if(response.status === 401){
                localStorage.removeItem("token");
                setPage("login");
                return;
            }

            const responseData = await response.json();

            setUser(responseData.data);

        }catch (error){
            console.error("Profile error", error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justifiy-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">
                <h2 className="text-2xl font-bold mb-4">Crowd-Sourced Travel Planner</h2>
                { user ? (
                    <>
                    <p> Welcome, <strong>{user.username}</strong></p>
                    </>
                ):(
                    <p> Loading profile ...</p>
                )}
            </div>
        </div>
    )
}
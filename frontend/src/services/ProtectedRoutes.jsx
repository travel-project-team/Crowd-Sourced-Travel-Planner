// Handles authentication check for protected routes

import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { usersApi } from "./api";

export const ProtectedRoutes = () => {
    const [authenticated, setAuthenticated] = useState(null);

    // Check authentication when entering protected routes
    useEffect(() => {
        async function checkAuth() {
            try {
                await usersApi.getProfile();
                setAuthenticated(true);
            } catch {
                setAuthenticated(false);
            }
        }

        checkAuth();
    }, []);

    // Wait until authentication check finishes
    if (authenticated === null) {
        return null;
    }

    return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
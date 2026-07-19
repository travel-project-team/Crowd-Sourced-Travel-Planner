// Handles authentication check for protected routes

import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { usersApi } from "../services/api";


export const ProtectedRoutes = () => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(null);

    // Check authentication if user enters protected route
    useEffect(() => {
        async function checkAuth() {
        try {
            await usersApi.getProfile();
            setAuthenticated(true);

        } catch {
            setAuthenticated(false);

        } finally {
            setLoading(false);}
        }

        checkAuth();
    }, []);

    // Only render pages once authentication is confirmed
    if (authenticated === null) {
        return null;
    }

    return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
    };
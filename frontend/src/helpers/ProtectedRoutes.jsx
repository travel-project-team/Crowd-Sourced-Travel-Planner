// Handles authentication check for protected routes

import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { usersApi } from "../services/api";

export const ProtectedRoutes = () => {
    const context = useOutletContext();
    const user = context?.user;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet context={context} />;
};
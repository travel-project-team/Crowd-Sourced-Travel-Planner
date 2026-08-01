// Citations:
// Rana, U. [Programming Fields]. (2026, February 2). How to Create Protected Routes in React
// | Auth Guard Example | React Router | React 19 - Ep 19 [Video]. YouTube.
// https://youtu.be/G1bBr8D6Ajc?si=kNYHZUfomDLG2St5

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
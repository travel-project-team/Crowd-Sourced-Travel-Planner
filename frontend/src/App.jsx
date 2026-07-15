// Citation: https://youtu.be/137uPoV_3xE?si=vYzo8cboZbOsgogC

// React libraries
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';

// Styling
import "./styles/App.css"

// Custom
import ServerHealth from "./components/common/ServerHealth";
import { Login } from './components/feature/Login';
import { Registration } from './components/feature/Registration';
import { Dashboard } from './components/feature/Dashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Trips } from './components/feature/Trips';
import { SingleExperience } from './components/feature/SingleExperience';
import { AddExperience } from './components/feature/AddExperience';
import { AddTrip } from './components/feature/AddTrip';
import { EditTrip } from './components/feature/EditTrip';
import { EditExperience } from './components/feature/EditExperience'

const ProtectedRoutes = () => {
  const token = localStorage.getItem("access_token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};



function App() {

  return (
    <>
     <ServerHealth />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/single-experience/:id" element={<SingleExperience />} />
              <Route path="/add-experience" element={<AddExperience />} />
              <Route path="/add-trip" element={<AddTrip />} />
              <Route path="/edit-trip/:id" element={<EditTrip />} />
              <Route path="/edit-experience/:id" element={<EditExperience />} />
            </Route>
          </Route>

          {/* Catch-all fallback redirect */}
          <Route
            path="*"
            element={<Navigate to={localStorage.getItem("access_token") ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
    </Router>
    </>
  )
}

export default App
// Citation: https://youtu.be/137uPoV_3xE?si=vYzo8cboZbOsgogC

// React libraries
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';

// Styling
import "./styles/App.css"

// Custom
import { Login } from './components/feature/Login';
import { Registration } from './components/feature/Registration';
import { HomePageLayout } from './layouts/HomePageLayout';
import { Trips } from './components/feature/Trips';
import { Experiences } from './components/feature/Experiences';
import { SingleExperience } from './components/feature/SingleExperience';
import { AddExperience } from './components/feature/AddExperience';
import { AddTrip } from './components/feature/AddTrip';
import { EditTrip } from './components/feature/EditTrip';
import { EditExperience } from './components/feature/EditExperience'
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { HomePage} from './pages/HomePage';
import { ChangePassword } from './pages/ChangePassword';
import { ProtectedRoutes } from "./services/ProtectedRoutes";



function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<HomePageLayout />}>
            <Route path="/home" element={<HomePage/>}/>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<HomePageLayout />}>
              <Route path="/profile" element={<Profile />}/>
              <Route path="/profile/edit" element={<EditProfile />}/>
              <Route path="/profile/change-password" element={<ChangePassword />}/>
              <Route path="/trips" element={<Trips />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/single-experience/:id" element={<SingleExperience />} />
              <Route path="/add-experience" element={<AddExperience />} />
              <Route path="/add-trip" element={<AddTrip />} />
              <Route path="/edit-trip/:id" element={<EditTrip />} />
              <Route path="/edit-experience/:id" element={<EditExperience />} />
            </Route>
          </Route>

          {/* Catch-all fallback redirect */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    </Router>
    </>
  )
}

export default App
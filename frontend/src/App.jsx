// Citation: https://youtu.be/137uPoV_3xE?si=vYzo8cboZbOsgogC

// React libraries
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import { SearchPage } from './pages/SearchPage';

// Styling
import "./styles/App.css"

// Custom
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';
import { HomePageLayout } from './layouts/HomePageLayout';
import { Trips } from './pages/Trips';
import { Experiences } from './pages/Experiences';
import { SingleExperience } from './pages/SingleExperience';
import { AddExperience } from './pages/AddExperience';
import { AddTrip } from './pages/AddTrip';
import { EditTrip } from './pages/EditTrip';
import { EditExperience } from './pages/EditExperience'
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { HomePage} from './pages/HomePage';
import { ChangePassword } from './pages/ChangePassword';
import { ProtectedRoutes } from "./helpers/ProtectedRoutes";



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
            {/* Protected Routes */}
            <Route element={<ProtectedRoutes />}>
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
                <Route path="/search" element={<SearchPage />} />
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
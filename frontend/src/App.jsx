// Citations:
// Rana, U. [Programming Fields]. (2026, January 23). React Auth Redirect Tutorial
// | Protected Dashboard After Login | React 19 - Ep 15 [Video]. YouTube.
// https://youtu.be/VeUz9i6MtFg?si=xar0_svc5HD_UF2Q
//
// Rana, U. [Programming Fields]. (2026, January 31). How to Use React Router
// | Complete Routing & Navigation Tutorial for Beginners | React 19 - Ep 18 [Video]. YouTube.
// https://youtu.be/l6i3LpwwsFE?si=tST31ELUneaKDjUl


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
import { ScrollToTop } from "./helpers/ScrollToTop";


function App() {

  return (
    <>
      <Router>
        <ScrollToTop />
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
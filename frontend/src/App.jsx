// React router + global layout wrapper
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import { LoginPage } from './pages/LoginPage'
import NavigationBar  from './components/NavigationBar';
import ServerHealth from "./components/ServerHealth";

function AuthenticatedLayout() {
  return (
    <div className="App">
      <center>
        <NavigationBar />
        <Outlet />
      </center>
    </div>
  );
}


function App() {
   const isLoggedIn = true;

  return (
    <Router>
      {/* Component: ServerHealth */}
      <ServerHealth />
      <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={isLoggedIn ? <AuthenticatedLayout /> : <Navigate to="/login" />}>
            {/* Navigation routes seen on Homepage*/}
            <Route path="/" element={<div>Welcome to the Homepage!</div>} />
            <Route path="/search-experiences" element={<div>Search Page Content</div>} />
            <Route path="/user-profile" element={<div>Profile Page Content</div>} />
          </Route>

          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
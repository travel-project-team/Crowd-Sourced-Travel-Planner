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


function App() {
  //  const [showLogin, setShowLogin] = useState(false);

   const [page, setPage] = useState(localStorage.getItem("token") ? "dashboard" : "login");

  return (
    <>
      <ServerHealth />
      <div>
        {/* {showLogin ? <Login /> : <Registration />} */}

        {page === "register" && <Registration setPage={setPage}/>}
        {page === "login" && <Login setPage={setPage}/>}
        {page === "dashboard" && <Dashboard setPage={setPage}/>}

        {(page === "register" ||  page === "login") && (
          <div className='toggle-wrapper'>
            {page === "login" ? (
              <p>Don't have an account? { " "}
              <button className="toggle-btn" onClick={() => setPage("register")}>Register</button></p>
            ):(
              <p>Already have an account? { " "}
              <button className="toggle-btn" onClick={() => setPage("login")}>Login</button></p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App
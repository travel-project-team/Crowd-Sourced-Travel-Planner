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
import { DashboardLayout } from './layouts/DashboardLayout';


function App() {
   const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <ServerHealth />
      <div>
        {showLogin ? <Login /> : <Registration />}
        <div className='toggle-wrapper'>
          {showLogin ? (
            <p>Don't have an account? { " "}
            <button className="toggle-btn" onClick={() => setShowLogin(false)}>Register</button></p>
          ):(
            <p>Already have an account? { " "}
            <button className="toggle-btn" onClick={() => setShowLogin(true)}>Login</button></p>
          )}
        </div>
      </div>
    </>
  )
}

export default App
// React router + global layout wrapper
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import ServerHealth from "./components/common/ServerHealth";
import { Login } from './components/feature/Login';
import { Registration } from './components/feature/Registration';
import { DashboardLayout } from './layouts/DashboardLayout';


function App() {
   const isLoggedIn = true;

  return (
    <>
      <ServerHealth />
      <Login/>
      {/* <Registration/> */}
    </>
  )
}

export default App
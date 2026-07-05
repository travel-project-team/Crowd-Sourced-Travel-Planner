// React router + global layout wrapper
import { useState, useEffect } from 'react'
import { LoginPage } from './pages/LoginPage'
import ServerHealth from "./components/ServerHealth";


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
    {/* Component: ServerHealth */}
    <ServerHealth />

    <div className="App">
      <center>
        <LoginPage/>
      </center>
    </div>
    </>
  )
}

export default App
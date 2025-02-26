import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/Loginpage";
import VerifyUserPage from "./pages/VerifyUserPage";

function Home(){
  return <div>hi</div>
}

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={ <Home /> }
        />

        <Route 
          path="/register"
          element={ <SignUpPage /> }
        />

        <Route 
          path="/login"
          element={ <LoginPage /> }
        />
        
        <Route 
          path="/verify"
          element={ <VerifyUserPage />}
        />

        <Route 
          path="*"
          element={ <Navigate to='/' replace /> }
        />

      </Routes>
    </>
  )
}

export default App;

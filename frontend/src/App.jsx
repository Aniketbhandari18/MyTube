import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"
import { Link } from "react-router-dom";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/Loginpage";
import VerifyUserPage from "./pages/VerifyUserPage";

function Home(){
  return <div className="min-h-screen bg-gray-100">
    <h1 className="text-center font-bold text-4xl mb-80">Home page</h1>
    <div className="bg-gray-100 flex justify-center items-center">
      <button className="py-2 px-4 bg-black text-white rounded-md">
        <Link to="/register">Sign Up</Link>
      </button>
    </div>
  </div>
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

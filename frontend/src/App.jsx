import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/Loginpage";
import VerifyUserPage from "./pages/VerifyUserPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

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

const RedirectAuthenticatedUser = ({ children }) =>{
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated){
    return <Navigate to="/" replace />
  }

  return children;
}

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() =>{
    checkAuth();
  }, []);

  if (isCheckingAuth) return <LoadingSpinner />

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
          element={ <RedirectAuthenticatedUser>
            <SignUpPage />
          </RedirectAuthenticatedUser> }
        />

        <Route 
          path="/login"
          element={ <RedirectAuthenticatedUser>
            <LoginPage />
          </RedirectAuthenticatedUser> }
        />
        
        <Route 
          path="/verify"
          element={ <RedirectAuthenticatedUser>
            <VerifyUserPage />
          </RedirectAuthenticatedUser> }
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

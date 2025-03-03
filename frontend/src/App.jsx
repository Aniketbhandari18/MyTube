import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/Loginpage";
import VerifyUserPage from "./pages/VerifyUserPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import HomePage from "./pages/HomePage";

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
          element={ <HomePage /> }
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

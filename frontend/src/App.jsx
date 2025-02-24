import { Navigate, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/loginPage";

function Home(){
  return <div>hi</div>
}

function App() {
  return (
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
        path="*"
        element={ <Navigate to='/' replace /> }
      />
    </Routes>
  )
}

export default App;

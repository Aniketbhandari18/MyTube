import { motion } from "framer-motion"
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react";
import { User, Lock } from "lucide-react";
import { userAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 30}}
        animate={{ opacity: 1, y: 0}}
        transition={{ duration: .5 }}
        className="max-w-sm w-full bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-xl py-4 pb-6 px-8"
      >
        <h2 className="text-3xl text-center font-bold mb-6">Create Account</h2>

        <form onSubmit={ handleLogin }>
          <Input
            icon={User}
            type="text"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-right mt-[-20px] mb-1.5">
            <Link 
              to={"/forgot-password"}
              className="text-blue-500 text-sm"
            >
              Forgot password
            </Link>
          </p>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.02 }}
            className="w-full p-1.5 mt-4 mb-1.5 rounded-sm cursor-pointer text-white bg-black transition duration-200"
          >
            Sign in
          </motion.button>
        </form>
        <p className="text-center text-sm text-gray-700">
          Don't have an account?
          <Link to={"/register"} className="ml-1.5 text-blue-500">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
export default LoginPage;
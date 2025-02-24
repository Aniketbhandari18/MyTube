import { motion } from "framer-motion";
import { useState } from "react";
import Input from "../components/Input";
import { User, Mail, Lock } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { userAuthStore } from "../store/authStore";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signup, isLoading, error } = userAuthStore();
  const navigate = useNavigate();

  const handleSignUp = async (event) =>{
    event.preventDefault();

    try {
      await signup(username, email, password, confirmPassword);
      navigate("/verify-user");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 30}}
        animate={{ opacity: 1, y: 0}}
        transition={{ duration: .5 }}
        className="max-w-sm w-full bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-xl py-4 pb-6 px-8"
      >
        <h2 className="text-3xl text-center font-bold mb-6">Create Account</h2>

        <form onSubmit={ handleSignUp }>
          <Input
            icon={User}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            icon={Lock}
            type="text"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.02 }}
            className="w-full p-1.5 mt-4 mb-1.5 rounded-sm cursor-pointer text-white bg-black transition duration-200"
          >
            Sign Up
          </motion.button>
        </form>
        <p className="text-center text-sm text-gray-700">
          Already have an account?
          <Link to={"/login"} className="ml-1.5 text-blue-500">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
export default SignUpPage;
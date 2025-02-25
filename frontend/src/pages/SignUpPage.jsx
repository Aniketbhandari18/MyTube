import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Input from "../components/Input";
import { User, Mail, Lock, Loader } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signup, isLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() =>{
    if (error) setError(null);
  }, [username, email, password, confirmPassword]);

  const handleSignUp = async (event) =>{
    event.preventDefault();

    try {
      await signup(username, email, password, confirmPassword);
      toast.success("Account created successfully. Please verify your email to login");
      navigate("/verify-user");
    } catch (err) {
      console.log(err);
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

          <p className="text-red-500 font-semibold text-sm mt-[-20px]">
            { error ? "*" + error: "" }
          </p>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.02 }}
            className="w-full p-1.5 mt-4 mb-1.5 font-semibold rounded-sm cursor-pointer text-white bg-black transition duration-200"
            disabled={ isLoading }
          >
            {isLoading ? <Loader className="animate-spin w-full [animation-duration:1.3s]" />: "Sign Up"}
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
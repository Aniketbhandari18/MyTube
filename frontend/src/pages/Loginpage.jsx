import { motion } from "framer-motion"
import Input from "../components/Input";
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { User, Lock, Loader } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast"

const LoginPage = () => {
  const [toVerifyPage, setToVerifyPage] = useState(false);

  const location = useLocation();
  const from = location.state?.from;

  const pageAnimation = (from === "verify") ? {
    initial: { opacity: 0, x: 400, scale: .9},
    animate: toVerifyPage ? { x: 450, scale: .9 }: { opacity: 1, x: 0, scale: 1},
    transition: { duration: .3 }
  }: {
    initial: { opacity: 0, y: 30, scale: .9},
    animate: toVerifyPage ? { x: 450, scale: .9 }: { opacity: 1, y: 0, scale: 1},
    transition: toVerifyPage ? { duration: .2 }: { duration: .5 }
  }

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() =>{
    setError(null);
  }, [identifier, password])

  const handleLogin = async (event) =>{
    event.preventDefault();

    try {
      await login(identifier, password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      if (err.response.status === 403){
        toast.error("Please verify your email to login");

        setToVerifyPage(true);
        setTimeout(() => {
          navigate("/verify", { state: { from: "login" } });
        }, 300);
      }

      toast.error(err.response.data.message || "Error logging in");
      console.log(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <motion.div
        {...pageAnimation}
        className="max-w-sm w-full bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-xl py-4 pb-6 px-8"
      >
        <h2 className="text-3xl text-center font-bold mb-6">Sign In</h2>

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

          <p className="mt-[-20px] mb-1.5 text-right">
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
            className="w-full p-1.5 mt-4 mb-1.5 rounded-sm cursor-pointer text-white bg-black transition duration-200 font-semibold"
            disabled={ isLoading }
          >
            { isLoading ? <Loader className="animate-spin w-full [animation-duration:1.3s]" />: "Sign in" }
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
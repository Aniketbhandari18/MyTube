import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useRef, useState } from "react";

const VerifyUserPage = () => {
  const [currIdx, setCurrIdx] = useState(0);
  const [code, setCode] = useState(Array(6).fill(""));
  const inputRef = useRef([]);

  const navigate = useNavigate();

  useEffect(() =>{
    inputRef.current[0].focus();
  }, []);

  const { verifyUser, isLoading } = useAuthStore();

  const handleClick = () =>{
    inputRef.current[currIdx === 6 ? 5: currIdx].focus();
  }

  const handleKeyDown = (event, idx) =>{
    const newCode = [...code];
    const key = event.key;

    if (key === "Backspace" && idx > 0){
      if (currIdx === 6){
        newCode[idx] = "";;
        setCode(newCode);
        setCurrIdx((prev) => prev - 1);
        return;
      }
      newCode[idx - 1] = "";
      setCode(newCode);
      inputRef.current[idx - 1].focus();
      setCurrIdx((prev) => prev - 1);
    }
  }

  const handleChange = (event, idx) =>{
    const newCode = [...code];

    const value = event.target.value;

    if (value >= '0' && value <= '9'){
      newCode[idx] = value;
      setCode(newCode); 
      setCurrIdx((prev) => prev + 1);

      if (idx < 5){
        inputRef.current[idx + 1].focus();
      }
    }
  }

  const handleVerification = async (event) =>{
    event.preventDefault();
    const verificationCode = code.join("");
    
    try {
      await verifyUser(verificationCode);
      toast.success("Email verified successfully. You can now login");

      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "Error verifying email");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: .9}}
        animate={{ opacity: 1, y: 0, scale: 1}}
        transition={{ duration: .5 }}
        className="max-w-sm w-full bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-xl py-4 pb-6 px-8"
      >
        <h2 className="text-3xl text-center font-bold mb-3">Verify Your Email</h2>
        <p className="text-center text-sm text-gray-600 font-semibold mb-6">Enter the 6 digit code sent to your email address.</p>

        <form onSubmit={ handleVerification }>

          <div className="flex justify-between mb-6">
            { 
              code.map((digit, idx) =>(
                <input 
                  key={idx}
                  type="text"
                  ref={(el) => inputRef.current[idx] = el}
                  maxLength={1}
                  value={digit}
                  onClick={() => handleClick()}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="text-center text-xl size-9 border-2 text-black font-bold border-gray-600 bg-gray-400 focus:outline-2 outline-gray-600 outline-offset-2 rounded-lg cursor-text"
                />
              ))
            }
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.02 }}
            className="w-full p-1.5 mt-4 mb-1.5 font-semibold rounded-sm cursor-pointer text-white bg-black transition duration-200"
            disabled={ isLoading }
          >
            {isLoading ? <Loader className="animate-spin w-full [animation-duration:1.3s]" />: "Verify Email"}
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
export default VerifyUserPage;
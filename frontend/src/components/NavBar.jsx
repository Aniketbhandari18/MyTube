import { useState } from "react"
import logo from "../assets/logo.png"
import videoIcon from "../assets/video-icon.png"
import { Search } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { Link } from "react-router-dom"

const NavBar = () => {
  const [focus, setFocus] = useState(false);

  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="absolute left-0 right-0 top-0 bg-white flex justify-between py-4 pl-16 sm:pl-24 pr-6 shadow-md">
      <div className="hidden sm:flex shrink-0 justify-between items-center">
        <img className="size-6 md:size-8" src={ videoIcon } />
        <img className="bg-transparent w-[150px] md:w-[170px]" src={ logo } />
      </div>

      <div className={`relative bg-white rounded-md flex items-center py-2 min-w-36 w-lg shadow-[0_1px_8px_rgb(0,0,0,0.2)] ml-4 mr-4 ${focus && "shadow-[0_2px_14px_rgb(0,0,0,0.2)]"}`}>
        <Search className="size-5 absolute left-4 top-2.5 text-gray-500" />
        <input 
          onFocus={() => setFocus(true)} 
          onBlur={() =>setFocus(false)}
          className="pl-12 outline-none h-full" 
          type="text" 
          placeholder="Search.." />
      </div>

      <div className="shrink-0">
        { 
          isAuthenticated?  user.avatar ?
            <img className="size-10" src="https://cdni.iconscout.com/illustration/premium/thumb/female-user-image-illustration-download-in-svg-png-gif-file-formats--person-girl-business-pack-illustrations-6515859.png?f=webp" />: 
  
            <div className="size-9 bg-purple-800 text-white rounded-full flex justify-center items-center font-semibold text-xl">
              { user.username.charAt(0).toUpperCase() }
            </div>
            : <button className="py-2 bg-gray-700 text-white rounded-md">
                <Link className="py-2 px-4" to="/register">
                  Sign up
                </Link>
              </button>
        }
      </div>
    </div>
  )
}
export default NavBar
import { ChevronRight, History, Home, List, LogOut, ThumbsUp, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef(null);

  const handleExpand = () =>{
    setIsExpanded(!isExpanded);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogOut = async () =>{
    try {
      await logout();

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div ref={sidebarRef} className={`fixed top-0 left-0 h-full bg-white shadow-xl sm:p-4 pt-50 sm:pt-50 ${isExpanded ? "w-60 p-2" : "w-16 sm:w-20 p-2"} duration-200 border-r-[.02rem] border-gray-200 z-50`}>

      <button onClick={handleExpand} className="absolute top-78 -right-3 rounded-full bg-gray-600 shadow-2xl cursor-pointer">
        <ChevronRight className={`size-6 text-white transition-transform duration-300 ${ isExpanded && "rotate-180" }`} />
      </button>

      <SidebarItem icon={Home} text="Home" isExpanded={isExpanded} tooltip="Home" to="/" />
      <SidebarItem icon={User} text="You" isExpanded={isExpanded} tooltip="You" to="/you" />

      <SidebarItem icon={History} text="History" isExpanded={isExpanded} tooltip="History" to="/history" />
      <SidebarItem icon={ThumbsUp} text="Liked Videos" isExpanded={isExpanded} tooltip="Liked Videos" to="/liked-videos" />

      <SidebarItem icon={List} text="All Subscriptions" isExpanded={isExpanded} tooltip="Subscriptions" to="/subscriptions" />


      { 
        isAuthenticated && 
        <button onClick={handleLogOut} className="absolute flex bg-black text-white bottom-4 rounded-md py-2 px-3 cursor-pointer">
          <LogOut className="size-6" />
          { isExpanded && <span className="ml-2 font-semibold text-md">
            Sign out
          </span> }
        </button> 
      }
    </div>
  )
}

const SidebarItem = ({ icon: Icon, text, isExpanded, tooltip, to }) =>{
  return (
    <NavLink to={to} className={({ isActive }) => `${!isExpanded && "group"} relative flex items-center w-full py-2 px-3 rounded-md cursor-pointer mb-3 ${isActive ? "bg-gray-300": "hover:bg-gray-200"}`}>
      <Icon className={`size-6 shrink-0`} />

      { isExpanded && <span className="font-semibold text-md ml-2 whitespace-nowrap">{text}</span> }

      <span className="duration-300 ml-6 pointer-events-none opacity-0 absolute left-6 top-2 py-1 px-2 rounded-md bg-gray-800 whitespace-nowrap text-white group-hover:left-full group-hover:opacity-100 group-hover:inline">{tooltip}</span>

      {/* <span 
        className={`ml-2 font-semibold text-md overflow-hidden transition-all duration-700 
        ${isExpanded ? "inline-block" : "hidden"}`}
      >{text}</span> */}
    </NavLink>
  )
}

export default Sidebar;
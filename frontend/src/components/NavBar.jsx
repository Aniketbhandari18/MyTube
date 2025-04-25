import defaultUser from "../assets/defaultUser.png"
import { useEffect, useRef, useState } from "react"
import logo from "../assets/logo.png"
import videoIcon from "../assets/video-icon.png"
import { Search } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { Link, useNavigate } from "react-router-dom"
import useDebounce from "../hooks/useDebounce"
import axios from "axios"
import useSearchStore from "../store/searchStore"

const NavBar = () => {
  const navigate = useNavigate();
  const [focus, setFocus] = useState(false);
  const [suggestions, setSuggestions] = useState();
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const { query, setQuery } = useSearchStore();

  const debouncedQuery = useDebounce(query)?.trim();

  const inputRef = useRef(null);

  const handleSearch = (e) =>{
    if (!query.trim()) return;

    if (e.key === "Enter"){
      inputRef.current.blur();
      navigate("/results?search_query=" + encodeURIComponent(query.trim()));
    }
  }

  const handleSuggestionClick = (suggestion) =>{
    console.log("hit");
    if (suggestion.type === "user"){
      setQuery("");
      navigate(`/channel/${suggestion.username}`);
    }
    else{
      navigate("/results?search_query=" + encodeURIComponent(suggestion.title));
    }
  }

  // autocomplete suggestions
  useEffect(() =>{
    if (debouncedQuery.length < 3){
      setSuggestions([]);
      return;
    }

    (async () =>{
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/search/suggestions`, {
          params: {
            search_query: query
          }
        });

        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    })()
  }, [debouncedQuery])

  return (
    <div 
      className="absolute left-0 right-0 top-0 bg-white flex justify-between shadow-md 
      py-4 pl-7 xs:pl-16 sm:pl-24 pr-3 xs:pr-6"
    >
      <div className="hidden sm:flex shrink-0 justify-between items-center">
        <img className="size-6 md:size-8" src={ videoIcon } />
        <img className="flex bg-transparent w-[150px] md:w-[170px]" src={ logo } />
      </div>
      
      <div className="xs:hidden shrink-0 flex justify-between items-center">
        <img className="size-9" src={ videoIcon } />
      </div>

      <div className={`relative bg-white rounded-md flex items-center py-2 min-w-36 w-lg shadow-[0_1px_8px_rgb(0,0,0,0.2)] ml-4 mr-4 ${focus && "shadow-[0_2px_14px_rgb(0,0,0,0.2)]"}`}>
        <Search className="size-[30px] absolute left-[7px] top-[4.2px] p-1 text-gray-500 cursor-pointer" />
        <input 
          ref={inputRef}
          value={query}
          onFocus={() => setFocus(true)} 
          onBlur={() => setTimeout(() => setFocus(false), 0)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="pl-12 outline-none h-full w-full" 
          type="text" 
          placeholder="Search.." />

        {/* Autocomplete Results */}
        {focus && suggestions.length > 0 && (
          <ul className="absolute top-[100%] left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-100 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion._id}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 items-center"
              >
                {suggestion.type === "video" ? (
                  <span className="font-medium">{suggestion.title}</span>
                ) : (
                  <>
                    <img
                      src={suggestion.avatar || defaultUser}
                      alt={suggestion.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{suggestion.username}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Loading State */}
        {loading && suggestions.length === 0 && (
          <ul className="absolute top-[100%] left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-100 overflow-y-auto">
            <li className="px-4 py-2 text-center">Loading...</li>
          </ul>
        )}

        {/* No Results */}
        {focus && debouncedQuery && suggestions.length === 0 && !loading && (
          <ul className="absolute top-[100%] left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-100 overflow-y-auto">
            <li className="px-4 py-2 text-gray-500">No results found</li>
          </ul>
        )}
      </div>

      <div className="shrink-0 rounded-full cursor-pointer">
        { 
          isAuthenticated?  user.avatar ?
            <Link to={`/channel/${user._id}`}>
              <img className="size-10 rounded-full" src={user.avatar} />
            </Link>: 
  
            <Link to={`/channel/${user._id}`}>
              <div className="size-9 bg-purple-800 text-white rounded-full flex justify-center items-center font-semibold text-xl">
                { user.username.charAt(0).toUpperCase() }
              </div>
            </Link>
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
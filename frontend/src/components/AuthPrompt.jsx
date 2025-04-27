import { Link } from "react-router-dom";

const AuthPrompt = ({ icon: Icon, title, description, btnText = "", btnLink = "" }) => {
  return (
    <div className="min-h-screen bg-gray-50 pr-3 md:pr-6 pt-21 xs:pt-24 pl-7 xs:pl-18 sm:pl-23 md:pl-26 pb-2">
      <div className="flex flex-col items-center justify-center text-center py-12 px-6 max-w-2xl w-full mx-auto">
        <div className="mb-3 sm:mb-6 text-gray-500">
          <Icon className="w-12 sm:w-16 h-12 sm:h-16 text-black" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-5 sm:mb-8 text-base sm:text-lg">{description}</p>
        {btnText && (
          <Link 
            to={btnLink} 
            className="px-6 py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition"
          >
            {btnText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuthPrompt;

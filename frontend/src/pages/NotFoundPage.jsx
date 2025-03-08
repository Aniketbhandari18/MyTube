import { Link } from "react-router-dom";
import HomeImg from "../assets/home-img.png";

const NotFoundPage = () => {
  return (
    <div className="home__container min-h-screen md:pb-50 flex justify-center gap-12 items-center flex-col md:flex-row">
      <div className="home__data flex items-center flex-col md:block">
        <p className="pb-2 font-semibold">Error 404</p>
        <h1 className="pb-4 text-5xl font-bold lg:text-6xl">Hey Buddy</h1>
        <p className="pb-8 font-semibold text-center md:text-start">
          We can't seem to find the page <br />
          you are looking for.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-gray-900 py-4 px-8 font-bold text-white"
        >
          Go Home
        </Link>
      </div>
      <div className="home__img justify-self-center">
        <img
          src={HomeImg}
          className="w-64 animate-floting md:w-[350px] lg:w-[400px]"
        />
        <div className="home__shadow mx-auto h-8 w-36 animate-shadow rounded-[50%] bg-gray-900/30 blur-md md:w-64"></div>
      </div>

    </div>
  )
}
export default NotFoundPage;
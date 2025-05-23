import { FaPlane } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-800 py-6 shadow-md">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex justify-between items-center">
        <Link to="/" className="relative inline-flex items-center">
          {/* Brand Name */}
          <span className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
            Wandr
          </span>

          {/* Plane + Trail */}
          <div className="relative ml-1">
            {/* Plane icon */}
            <FaPlane className="text-white text-2xl rotate-[-45deg] drop-shadow-sm relative z-10" />

            {/* Professional-looking curve */}
            <svg
              className="absolute -left-25 top-3 z-0"
              width="110"
              height="40"
              viewBox="0 0 160 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,30 C25,5 60,30 90,20 C115,10 140,20 150,7"
                stroke="#ffffffcc"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </Link>
        <div className="text-white font-medium flex gap-4">
          <p className="cursor-pointer hover:underline">
            <Link to="/privacy-policy">Privacy Policy</Link>
          </p>
          <p className="cursor-pointer hover:underline">
            <Link to="/terms-of-service">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

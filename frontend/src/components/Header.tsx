import { Link, useNavigate } from "react-router-dom";
import { UseAppContext } from "../contexts/AppContext";
import { signOut, fetchCurrentUser } from "../api-client";
import { FaHeart, FaPlane } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { UserType } from "../../../backend/src/shared/types";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = UseAppContext();
  const [user, setUser] = useState<UserType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    if (isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLoggedIn(false);
      setDropdownOpen(false);
      navigate("/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : "U";

  return (
    <header className="bg-blue-800 py-4 shadow-md">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex justify-between items-center">
        {/* Logo + Brand Name */}
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

        <span className="flex items-center space-x-2">
          {isLoggedIn ? (
            <>
              <Link
                className="flex items-center text-white px-3 py-2 font-bold hover:bg-blue-600 rounded-md"
                to="/favorites"
              >
                <FaHeart className="w-5 h-5 text-white" />
              </Link>

              <Link
                className="flex items-center text-white px-3 py-2 font-bold hover:bg-blue-600 rounded-md"
                to="/my-bookings"
              >
                My Bookings
              </Link>
              <Link
                className="flex items-center text-white px-3 py-2 font-bold hover:bg-blue-600 rounded-md"
                to="/my-hotels"
              >
                My Hotels
              </Link>

              {/* Avatar + Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(true);
                  }}
                  onBlur={(e) => {
                    if (
                      !dropdownRef.current?.contains(e.relatedTarget as Node)
                    ) {
                      setDropdownOpen(false);
                    }
                  }}
                  className="cursor-pointer bg-white text-blue-800 w-10 h-10 flex items-center justify-center rounded-full font-semibold focus:outline-none"
                >
                  {initials.toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-10">
                    <Link
                      to="/edit-profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="bg-white text-blue-600 px-4 py-2 font-bold rounded-md hover:bg-gray-100 shadow"
            >
              Sign in
            </Link>
          )}
        </span>
      </div>
    </header>
  );
};

export default Header;

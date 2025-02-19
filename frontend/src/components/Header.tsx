import { Link } from "react-router-dom";
import { UseAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";

const Header = () => {
  const { isLoggedIn } = UseAppContext();
  return (
    <header className="bg-blue-800 py-4 shadow-md">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex justify-between items-center">
        <span className="text-3xl font-bold text-white tracking-tight">
          <Link to="/">Booking.com</Link>
        </span>
        <span className="flex space-x-2">
          {isLoggedIn ? (
            <>
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
              <SignOutButton />
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

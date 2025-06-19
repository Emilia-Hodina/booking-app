import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as apiClient from "../api-client";
import { UseAppContext } from "../contexts/AppContext";
import { FaPlane } from "react-icons/fa";

export type SignInFormData = {
  email: string;
  password: string;
};

const SignIn = () => {
  const { showToast, setIsLoggedIn, setUserRole } = UseAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirectTo");
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInFormData>();

  const mutation = useMutation({
    mutationFn: apiClient.signIn,
    onSuccess: async (data) => {
      const { user } = data;
      setIsLoggedIn(true);
      setUserRole(user.role);
      showToast({ message: "Login successful", type: "SUCCESS" });
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });

      const pendingFavorite = localStorage.getItem("pendingFavorite");
      if (pendingFavorite) {
        try {
          const hotel = JSON.parse(pendingFavorite);
          if (hotel && hotel._id) {
            await apiClient.addFavorite(hotel._id);
            showToast({ message: "Hotel added to favorites", type: "SUCCESS" });
          }
        } catch (error) {
          console.error("Invalid favorite format or failed request:", error);
        } finally {
          localStorage.removeItem("pendingFavorite");
        }
      }

      if (redirectTo) {
        console.log("WTFs");
        navigate(redirectTo);
      } else if (user?.role === "admin" || user?.role === "user") {
        navigate("/redirect");
      } else {
        navigate("/");
      }
    },
    onError: (error: Error) => {
      showToast({ message: error.message || "Login failed", type: "ERROR" });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-blue-800 flex flex-col items-center justify-center px-4">
      {/* Brand from Header (unaltered) */}
      <Link to="/" className="relative inline-flex items-center mb-8">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
          Wandr
        </span>
        <div className="relative ml-1">
          <FaPlane className="text-white text-2xl rotate-[-45deg] drop-shadow-sm relative z-10" />
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

      {/* Sign In Form (unchanged size/design) */}
      <form
        className="max-w-md w-full bg-white shadow-md rounded-lg p-6 flex flex-col gap-5"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-bold text-center">Sign In</h2>

        <label className="text-gray-700 text-sm font-bold">
          Email
          <input
            type="email"
            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
            {...register("email", { required: "This field is required" })}
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
          )}
        </label>

        <label className="text-gray-700 text-sm font-bold">
          Password
          <input
            type="password"
            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
            {...register("password", {
              required: "This field is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password && (
            <span className="text-red-500 text-xs">
              {errors.password.message}
            </span>
          )}
        </label>

        <div className="flex items-center justify-between">
          <span className="text-sm">
            Not registered?{" "}
            <Link
              className="underline text-blue-600 hover:text-blue-500"
              to="/register"
            >
              Create an account
            </Link>
          </span>
          <Link
            className="text-sm text-blue-600 hover:text-blue-500"
            to="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 font-bold rounded hover:bg-blue-500 text-lg w-full mt-2"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default SignIn;

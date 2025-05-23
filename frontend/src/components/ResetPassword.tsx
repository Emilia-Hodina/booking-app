import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as apiClient from "../api-client";
import { UseAppContext } from "../contexts/AppContext";
import { FaPlane } from "react-icons/fa";
import { Link } from "react-router-dom";

export type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = UseAppContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const mutation = useMutation({
    mutationFn: apiClient.resetPassword,
    onSuccess: () => {
      showToast({
        message: "Password successfully reset!",
        type: "SUCCESS",
      });

      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    },
    onError: (error: Error) => {
      showToast({
        message: error.message || "Failed to reset password.",
        type: "ERROR",
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!token) {
      showToast({
        message: "Missing or invalid reset token.",
        type: "ERROR",
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      showToast({
        message: "Passwords do not match!",
        type: "ERROR",
      });
      return;
    }

    mutation.mutate({ token, password: data.password });
  });

  return (
    <div className="min-h-screen bg-blue-800 flex flex-col items-center justify-center px-4">
      {/* Brand Header */}
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

      {/* Form Container */}
      <form
        className="max-w-md w-full bg-white shadow-md rounded-lg p-6 flex flex-col gap-5"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-bold text-center">Reset Password</h2>

        <label className="text-gray-700 text-sm font-bold">
          New Password
          <input
            type="password"
            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
          {errors.password && (
            <span className="text-red-500 text-xs">
              {errors.password.message}
            </span>
          )}
        </label>

        <label className="text-gray-700 text-sm font-bold">
          Confirm Password
          <input
            type="password"
            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
            {...register("confirmPassword", {
              required: "Confirm your password",
            })}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 font-bold rounded hover:bg-blue-500 text-lg w-full mt-2"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { FaPlane } from "react-icons/fa";

export type ForgotPasswordFormData = {
  email: string;
};

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const mutation = useMutation({
    mutationFn: apiClient.forgotPassword,
    onSuccess: () => {
      alert("If your email exists, a reset link has been sent!");
    },
    onError: (error: Error) => {
      alert(error.message || "Error sending reset email.");
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-blue-800 flex flex-col items-center justify-center px-4">
      {/* Brand from Header (same as SignIn) */}
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

      {/* Forgot Password Form (same styling as SignIn) */}
      <form
        className="max-w-md w-full bg-white shadow-md rounded-lg p-6 flex flex-col gap-5"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-bold text-center">Forgot Password</h2>

        <label className="text-gray-700 text-sm font-bold">
          Enter your email
          <input
            type="email"
            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
          )}
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 font-bold rounded hover:bg-blue-500 text-lg w-full mt-2"
        >
          Send Reset Link
        </button>

        <div className="text-center text-sm mt-2">
          Remember your password?{" "}
          <Link
            to="/sign-in"
            className="text-blue-600 underline hover:text-blue-500"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;

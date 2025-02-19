import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as apiClient from "../api-client";
import { UseAppContext } from "../contexts/AppContext";
import { Link, useNavigate } from "react-router-dom";

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = UseAppContext();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const mutation = useMutation({
    mutationFn: apiClient.register,
    onSuccess: async () => {
      showToast({ message: "Account created successfully", type: "SUCCESS" });
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
      navigate("/");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = handleSubmit((data) => {
    return mutation.mutate(data);
  });

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 flex justify-center">
      <form
        className="max-w-lg w-full bg-white shadow-md rounded-lg p-6 flex flex-col gap-5"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-bold text-center">Create an account</h2>

        {/* First & Last Name */}
        <div className="flex flex-col md:flex-row gap-5">
          <label className="text-gray-700 text-sm font-bold flex-1">
            First Name
            <input
              className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
              {...register("firstName", { required: "This field is required" })}
            />
            {errors.firstName && (
              <span className="text-red-500 text-xs">
                {errors.firstName.message}
              </span>
            )}
          </label>
          <label className="text-gray-700 text-sm font-bold flex-1">
            Last Name
            <input
              className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
              {...register("lastName", { required: "This field is required" })}
            />
            {errors.lastName && (
              <span className="text-red-500 text-xs">
                {errors.lastName.message}
              </span>
            )}
          </label>
        </div>

        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm Password */}
        <label className="text-gray-700 text-sm font-bold">
          Confirm Password
          <input
            type="password"
            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
            {...register("confirmPassword", {
              validate: (val) => {
                if (!val) return "This field is required";
                if (watch("password") !== val) return "Passwords do not match";
              },
            })}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 font-bold rounded hover:bg-blue-500 text-lg"
        >
          Register
        </button>

        <p className="text-center text-gray-600 text-sm">
          Already registered?{" "}
          <Link
            to="/sign-in"
            className="text-blue-600 underline hover:text-blue-500"
          >
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

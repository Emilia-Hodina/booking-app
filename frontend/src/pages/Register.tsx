import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import * as apiClient from "../api-client";
import { UseAppContext } from "../contexts/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { FaPlane } from "react-icons/fa";

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  country: string;
};

const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = UseAppContext();

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const countryOptions = useMemo(() => countryList().getData(), []);

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
    mutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-blue-800 flex flex-col items-center justify-center px-4">
      {/* Wandr Brand */}
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

      {/* Register Form */}
      <form
        className="w-full max-w-md bg-white shadow-md rounded-lg p-4 md:p-6 flex flex-col gap-5"
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

        {/* Phone Number */}
        <label className="text-gray-700 text-sm font-bold">
          Phone Number
          <input
            type="tel"
            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
            {...register("phoneNumber", {
              required: "This field is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Phone number must be exactly 10 digits",
              },
            })}
          />
          {errors.phoneNumber && (
            <span className="text-red-500 text-xs">
              {errors.phoneNumber.message}
            </span>
          )}
        </label>

        {/* Country  */}
        <div>
          <label className="text-gray-700 text-sm font-bold mb-1 block">
            Country
          </label>
          <Controller
            name="country"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={countryOptions}
                value={countryOptions.find((opt) => opt.value === field.value)}
                onChange={(val) => field.onChange(val?.value)}
                placeholder="Select your country"
                isSearchable
              />
            )}
          />
          {errors.country && (
            <span className="text-red-500 text-xs font-bold">
              {errors.country.message}
            </span>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="flex flex-col md:flex-row gap-5">
          <label className="text-gray-700 text-sm font-bold flex-1">
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

          <label className="text-gray-700 text-sm font-bold flex-1">
            Confirm Password
            <input
              type="password"
              className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500"
              {...register("confirmPassword", {
                validate: (val) => {
                  if (!val) return "This field is required";
                  if (watch("password") !== val)
                    return "Passwords do not match";
                },
              })}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs">
                {errors.confirmPassword.message}
              </span>
            )}
          </label>
        </div>

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

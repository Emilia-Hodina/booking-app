import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as apiClient from "../api-client";
import { UseAppContext } from "../contexts/AppContext";

export type SignInFormData = {
    email: string;
    password: string;
};

const SignIn = () => {

    const {showToast} = UseAppContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { register,
        formState: { errors } ,
        handleSubmit
        } = useForm<SignInFormData>();

    const mutation = useMutation({
        mutationFn: apiClient.signIn, 
        onSuccess: async () => {
            showToast({message:"Login successful", type: "SUCCESS"});
            queryClient.invalidateQueries({ queryKey: ["validateToken"] });
            navigate("/");
        },
        onError: (error: Error) => {
            showToast({message:error.message, type: "ERROR"});
        }
    })

    const onSubmit = handleSubmit((data)=>{
        mutation.mutate(data)
    })

    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-12 flex justify-center">
            <form className="max-w-md w-full bg-white shadow-md rounded-lg p-6 flex flex-col gap-5" onSubmit={onSubmit}>
                <h2 className="text-3xl font-bold text-center">Sign In</h2>

                {/* Email Input */}
                <label className="text-gray-700 text-sm font-bold">
                    Email
                    <input 
                        type="email" 
                        className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500" 
                        {...register("email", { required: "This field is required" })} 
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                </label>

                {/* Password Input */}
                <label className="text-gray-700 text-sm font-bold">
                    Password
                    <input 
                        type="password" 
                        className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-blue-500" 
                        {...register("password", { 
                            required: "This field is required", 
                            minLength: { value: 8, message: "Password must be at least 8 characters" } 
                        })} 
                    />
                    {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                </label>

                {/* Sign In & Register Link */}
                <div className="flex items-center justify-between">
                    <span className="text-sm">
                        Not registered?{" "}
                        <Link className="underline text-blue-600 hover:text-blue-500" to="/register">
                            Create an account here
                        </Link>
                    </span>
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 font-bold rounded hover:bg-blue-500 text-lg">
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignIn;

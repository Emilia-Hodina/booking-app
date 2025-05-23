import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { loadStripe, Stripe } from "@stripe/stripe-js";

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || "";

type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  userRole: "admin" | "user" | null;
  setUserRole: (role: "admin" | "user" | null) => void;
  stripePromise: Promise<Stripe | null>;
  loadingUser: boolean;
};

const AppContext = React.createContext<AppContext | undefined>(undefined);
const stripePromise = loadStripe(STRIPE_PUB_KEY);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const { data, isError } = useQuery({
    queryKey: ["validateToken"],
    queryFn: apiClient.fetchCurrentUser,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      setIsLoggedIn(false);
      setUserRole(null);
      setLoadingUser(false);
    } else if (data) {
      setIsLoggedIn(true);
      setUserRole(data.role);
      setLoadingUser(false);
    }
  }, [data, isError]);

  return (
    <AppContext.Provider
      value={{
        showToast: (toastMessage) => setToast(toastMessage),
        isLoggedIn,
        setIsLoggedIn,
        userRole,
        setUserRole,
        stripePromise,
        loadingUser,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)}
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

export const UseAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("UseAppContext must be used within AppContextProvider");
  }
  return context;
};

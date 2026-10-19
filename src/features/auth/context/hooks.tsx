import { useContext } from "react";
import { AuthPageContext } from "@/features/auth/context/index";
import { useAuth } from "@/features/auth/context/auth-context";
import type { AuthPageContextType } from "@/features/auth/types/context";

export const useAuthPageContext = (): AuthPageContextType => {
  const context = useContext(AuthPageContext);
  if (!context) {
    throw new Error("useAuthPageContext must be used within an AuthPageProvider");
  }
  return context;
};

export { useAuth };

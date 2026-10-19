import { useContext } from "react";
import { UsersContext } from "@/features/users/context/index";
import type { UsersContextType } from "@/features/users/types/context";

export function useUsersContext(): UsersContextType {
  const ctx = useContext(UsersContext);
  if (!ctx) {
    throw new Error("useUsersContext must be used within a UsersProvider");
  }
  return ctx;
}

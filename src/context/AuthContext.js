import { createContext, useContext } from "react";

// context + hook live here (no component export) to keep the provider
// fast-refresh friendly
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

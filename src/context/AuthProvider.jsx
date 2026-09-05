import { useEffect, useState } from "react";
import api, { TOKEN_KEY, USER_KEY } from "../api/axios";
import { AuthContext } from "./AuthContext";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  // keep react state and localStorage in sync in one place
  const persist = (nextToken, nextUser) => {
    setToken(nextToken);
    setCurrentUser(nextUser);
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/users/login", { email, password });
    persist(data.data.token, data.data.user);
  };

  const signup = async (payload) => {
    const { data } = await api.post("/users/signup", payload);
    persist(data.data.token, data.data.user);
  };

  const logout = () => persist(null, null);

  // an account edit hands back the updated record, in the same shape login
  // returns. mirroring it into the session keeps the navbar greeting and
  // isAdmin off login-time values, which otherwise sat stale until a re-login.
  // an admin editing someone else's account passes through here too, so the id
  // check is what stops their session picking up the other person's details
  const updateCurrentUser = (user) => {
    if (!user?._id || user._id !== currentUser?._id) {
      return;
    }
    persist(token, user);
  };

  // the axios interceptor clears storage and fires this when a token is
  // rejected mid-session; mirror that into react state
  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setCurrentUser(null);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, currentUser, login, signup, logout, updateCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

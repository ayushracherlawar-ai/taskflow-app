import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user,  setUser]  = useState(() => {
    const t = localStorage.getItem("token");
    if (!t) return null;
    try { return jwtDecode(t); } catch { return null; }
  });

  const login = (jwtToken, userObj = null) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    try { setUser(userObj ?? jwtDecode(jwtToken)); }
    catch { setUser(null); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
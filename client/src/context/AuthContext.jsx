import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, clearToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
const [user, setUser] = useState({
  id: "USR-01",
  name: "Vikram Malhotra",
  role: "Manager",
  email: "manager@cryoguard.demo",
});
  const [loading, setLoading] = useState(true);

  // if there is a saved token, find out who it belongs to
  useEffect(() => {
  setLoading(false);
}, []);
  async function login(email, password) {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

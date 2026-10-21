import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, clearToken } from "../api/client";

const AuthContext = createContext(null);

const DEFAULT_COMPANY_MANAGER = {
  id: "cmgr-001",
  name: "Arvind Kapoor",
  email: "arvind.kapoor.mcpe-001@cryoguard.demo",
  role: "Manager",
  accountType: "Company Manager",
  companyId: "MCPE-001",
  companyName: "Mumbai Coastal Protein Exports",
  sourceName: "Mumbai Frozen Foods Processing Plant",
  location: "Mumbai",
};

export function AuthProvider({ children }) {
  const currentToken = getToken();
  if (!currentToken || currentToken === "demo-token:mgr-001:global") {
    setToken(`demo-token:${DEFAULT_COMPANY_MANAGER.id}:company:${DEFAULT_COMPANY_MANAGER.companyId}`);
  }
const [user, setUser] = useState(DEFAULT_COMPANY_MANAGER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/auth/me")
      .then((savedUser) => savedUser && setUser(savedUser))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
}, []);
  async function login(email, password) {
    const credentials = typeof email === "object" && email !== null
      ? email
      : { email, password };
    const data = await api("/auth/login", { method: "POST", body: credentials });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    clearToken();
    setUser(DEFAULT_COMPANY_MANAGER);
  }

  function updateCurrentUser(nextUser) {
    setUser((current) => ({ ...current, ...nextUser }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

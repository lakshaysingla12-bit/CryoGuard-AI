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
  let savedSession = null;
  try {
    savedSession = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
  } catch {
    savedSession = null;
  }
  const managerSession = savedSession?.role === "manager" ? savedSession : null;
  if (!currentToken && managerSession?.user) {
    setToken(`demo-token:${managerSession.user.id}:company:${managerSession.user.companyId}`);
  }
  const [user, setUser] = useState(managerSession?.user || DEFAULT_COMPANY_MANAGER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!managerSession) {
      setLoading(false);
      return;
    }
    api("/auth/me")
      .then((savedUser) => savedUser && setUser(savedUser))
      .catch(() => setUser(managerSession.user))
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
    localStorage.removeItem("cryoguard_demo_session");
    setUser(DEFAULT_COMPANY_MANAGER);
    window.location.assign("/");
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

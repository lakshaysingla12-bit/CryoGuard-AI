
import { createContext, useContext, useState } from "react";

const WorkerContext = createContext(null);

export function WorkerProvider({ children }) {
  const [worker, setWorker] = useState({
    name: "Rohit Kumar",
    email: "rohit@cryoguard.com",
    phone: "9876543210",
  });

  const [language, setLanguage] = useState("EN");

  function updateWorker(details) {
    setWorker((previous) => ({
      ...previous,
      ...details,
    }));
  }

  function toggleLanguage() {
    setLanguage((previous) => (previous === "EN" ? "HI" : "EN"));
  }

  return (
    <WorkerContext.Provider
      value={{ worker, updateWorker, language, toggleLanguage }}
    >
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorker() {
  const context = useContext(WorkerContext);

  if (context === null) {
    throw new Error("useWorker must be used inside WorkerProvider");
  }

  return context;
}

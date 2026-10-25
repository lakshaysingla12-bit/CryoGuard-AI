export const SESSION_KEY = "cryoguard_demo_session";
export const TOKEN_KEY = "cryoguard_token";
export const REGISTERED_USERS_KEY = "cryoguard_registered_accounts";

// Built-in 3 consistent demo accounts matching db.json:
export const DEMO_CREDENTIALS = {
  manager: {
    role: "manager",
    email: "manager@cryoguard.demo",
    id: "cmgr-001",
    password: "password123",
    name: "Arvind Kapoor",
    companyId: "MCPE-001",
    companyName: "Mumbai Coastal Protein Exports",
    location: "Mumbai",
    sourceName: "Mumbai Frozen Foods Processing Plant",
  },
  worker: {
    role: "worker",
    email: "worker@cryoguard.demo",
    id: "wrk-mcpe-001-01",
    password: "password123",
    name: "Priya Singh",
    companyId: "MCPE-001",
    companyName: "Mumbai Coastal Protein Exports",
    location: "Mumbai",
    companyManagerId: "cmgr-001",
    companyManagerName: "Arvind Kapoor",
    sourceName: "Mumbai Frozen Foods Processing Plant",
    vehicleId: "TRK-01",
    assignedShipmentId: "SHP-1021",
  },
  auditor: {
    role: "auditor",
    email: "auditor@cryoguard.demo",
    id: "aud-001",
    password: "password123",
    name: "Kabir Anand",
    facilityId: "FAC-PUN-001",
    facilityName: "Pune Frozen Foods Distribution Hub",
    facilityType: "Cold-chain receiving facility",
    location: "Pune",
    designation: "Lead Receiving Quality Auditor",
    licenseNo: "LIC-QA-FAC-PUN-001",
  },
};

function getRegisteredAccounts() {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRegisteredAccount(user) {
  const existing = getRegisteredAccounts();
  const filtered = existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
  filtered.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(filtered));
}

async function readCollection(name) {
  try {
    const response = await fetch(`/api/${name}`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

const normalize = (value) => String(value || "").trim().toLowerCase();

export function saveSession(role, user) {
  const cleanRole = String(role || user.role || "").toLowerCase();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role: cleanRole, accountId: user.id, user }));
  const scope = cleanRole === "auditor" ? `facility:${user.facilityId || user.id}` : `company:${user.companyId || user.id}`;
  localStorage.setItem(TOKEN_KEY, `demo-token:${user.id}:${scope}`);
  return `/portals/${cleanRole}/index.html`;
}

export async function loginWithDemoAccount(roleOrOptions, rawIdentifier, rawPassword) {
  let role = "";
  let identifier = "";
  let password = "";

  if (typeof roleOrOptions === "object" && roleOrOptions !== null) {
    role = roleOrOptions.role;
    identifier = roleOrOptions.identifier || roleOrOptions.email;
    password = roleOrOptions.password;
  } else {
    role = roleOrOptions;
    identifier = rawIdentifier;
    password = rawPassword;
  }

  const cleanRole = normalize(role);
  const key = normalize(identifier);

  if (!cleanRole) throw new Error("Please select your role (Manager, Auditor, or Worker).");
  if (!key) throw new Error("Enter your account ID or email.");

  // Check 1: Check Registered Users in LocalStorage
  const registered = getRegisteredAccounts();
  const regUser = registered.find(
    (u) => normalize(u.role) === cleanRole && (normalize(u.email) === key || normalize(u.id) === key)
  );

  if (regUser) {
    if (password && regUser.password && regUser.password !== password) {
      throw new Error("Incorrect password for this account.");
    }
    return saveSession(cleanRole, regUser);
  }

  // Check 2: Built-in 3 Demo Accounts
  const demoAccount = DEMO_CREDENTIALS[cleanRole];
  if (
    demoAccount &&
    (normalize(demoAccount.email) === key ||
      normalize(demoAccount.id) === key ||
      key === "manager" ||
      key === "worker" ||
      key === "auditor" ||
      key.includes(cleanRole))
  ) {
    if (password && password !== "password123" && password !== demoAccount.password) {
      throw new Error("Incorrect password. Demo password is: password123");
    }
    return saveSession(cleanRole, demoAccount);
  }

  // Check 3: Check db.json via API
  if (cleanRole === "manager") {
    const managers = await readCollection("companyManagers");
    const companies = await readCollection("companies");
    const manager = managers.find((entry) =>
      [entry.id, entry.managerId, entry.email].some((val) => normalize(val) === key)
    );
    if (manager) {
      if (password && manager.password && manager.password !== password && password !== "password123") {
        throw new Error("Incorrect password. Demo password is: password123");
      }
      const company = companies.find((entry) => entry.id === manager.companyId) || {
        id: manager.companyId || "CMP-001",
        name: manager.companyName || "Cold Chain Logistics Ltd",
      };
      return saveSession("manager", {
        ...manager,
        role: "Manager",
        companyId: company.id,
        companyName: company.name,
      });
    }
  }

  if (cleanRole === "worker") {
    const users = await readCollection("users");
    const worker = users.find(
      (entry) =>
        normalize(entry.role) === "worker" &&
        [entry.id, entry.email].some((val) => normalize(val) === key)
    );
    if (worker) {
      if (password && worker.password && worker.password !== password && password !== "password123") {
        throw new Error("Incorrect password. Demo password is: password123");
      }
      return saveSession("worker", worker);
    }
  }

  if (cleanRole === "auditor") {
    const users = await readCollection("users");
    const auditor = users.find(
      (entry) =>
        normalize(entry.role) === "auditor" &&
        [entry.id, entry.facilityId, entry.email].some((val) => normalize(val) === key)
    );
    if (auditor) {
      if (password && auditor.password && auditor.password !== password && password !== "password123") {
        throw new Error("Incorrect password. Demo password is: password123");
      }
      const facilities = await readCollection("facilities");
      const facility = facilities.find((entry) => entry.id === (auditor.facilityId || auditor.id)) || {
        id: auditor.facilityId || auditor.id || "FAC-001",
        name: auditor.facilityName || "Regional Receiving Cold Store",
      };
      return saveSession("auditor", {
        ...auditor,
        role: "Auditor",
        facilityId: facility.id,
        facilityName: facility.name,
        facilityType: facility.type || facility.facilityType || "Cold-chain receiving facility",
      });
    }
  }

  // Check 4: If identifier matches demo default email even if API is offline
  if (key.includes("manager") && cleanRole === "manager") return saveSession("manager", DEMO_CREDENTIALS.manager);
  if (key.includes("worker") && cleanRole === "worker") return saveSession("worker", DEMO_CREDENTIALS.worker);
  if (key.includes("auditor") && cleanRole === "auditor") return saveSession("auditor", DEMO_CREDENTIALS.auditor);

  throw new Error(`Account "${identifier}" not found for role "${role}". Use demo ID or sign up below.`);
}

export async function registerNewAccount(formData) {
  const role = normalize(formData.role);
  if (!role || (role !== "manager" && role !== "auditor")) {
    throw new Error("Please select either Manager or Auditor role for signup.");
  }
  if (!formData.fullName || formData.fullName.trim().length < 2) {
    throw new Error("Please enter your full name.");
  }
  if (!formData.email || !formData.email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }
  if (!formData.password || formData.password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const existingAccounts = getRegisteredAccounts();
  if (existingAccounts.some((u) => normalize(u.email) === normalize(formData.email))) {
    throw new Error("An account with this email address already exists.");
  }

  const stamp = Date.now().toString(36).toUpperCase();
  let newUser = null;

  if (role === "manager") {
    if (!formData.companyName || formData.companyName.trim().length < 2) {
      throw new Error("Please enter your company name.");
    }
    const newId = `cmgr-reg-${stamp.toLowerCase()}`;
    const companyId = `CMP-${stamp}`;
    newUser = {
      id: newId,
      managerId: newId,
      name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: "Manager",
      companyId,
      companyName: formData.companyName.trim(),
      location: formData.location || "Mumbai",
      sourceName: formData.sourceName || `${formData.companyName.trim()} Dispatch Center`,
      status: "Active",
      phone: formData.phone || "+91 98765 00000",
      createdAt: new Date().toISOString(),
    };
  } else {
    // Auditor
    if (!formData.facilityName || formData.facilityName.trim().length < 2) {
      throw new Error("Please enter the receiving facility or hospital name.");
    }
    const newId = `aud-reg-${stamp.toLowerCase()}`;
    const facilityId = `FAC-${stamp}`;
    newUser = {
      id: newId,
      name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: "Auditor",
      facilityId,
      facilityName: formData.facilityName.trim(),
      facilityType: formData.facilityType || "Hospital",
      location: formData.location || "Delhi",
      licenseNo: formData.licenseNo || `LIC-QA-${facilityId}`,
      designation: formData.designation || "Lead Receiving Quality Inspector",
      status: "Active",
      phone: formData.phone || "+91 98765 00000",
      createdAt: new Date().toISOString(),
    };
  }

  // Persist locally
  saveRegisteredAccount(newUser);

  // Attempt async sync to API if available
  try {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }).catch(() => {});
  } catch {}

  // Auto-login new user
  const portalPath = saveSession(role, newUser);
  return { success: true, portalPath, user: newUser };
}

export function readDemoSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

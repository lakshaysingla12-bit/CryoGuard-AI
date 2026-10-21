export const SESSION_KEY = "cryoguard_demo_session";
export const TOKEN_KEY = "cryoguard_token";

async function readCollection(name) {
  const response = await fetch(`/api/${name}`);
  if (!response.ok) throw new Error(`Could not load ${name} accounts.`);
  return response.json();
}

const normalize = (value) => String(value || "").trim().toLowerCase();

function saveSession(role, user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role, accountId: user.id, user }));
  const scope = role === "auditor" ? `facility:${user.facilityId}` : `company:${user.companyId}`;
  localStorage.setItem(TOKEN_KEY, `demo-token:${user.id}:${scope}`);
  return `/portals/${role}/`;
}

export async function loginWithDemoAccount(role, identifier) {
  const key = normalize(identifier);
  if (!key) throw new Error("Enter your account ID or email.");

  if (role === "manager") {
    const [managers, companies] = await Promise.all([
      readCollection("companyManagers"),
      readCollection("companies"),
    ]);
    const manager = managers.find((entry) =>
      [entry.id, entry.managerId, entry.email].some((value) => normalize(value) === key),
    );
    if (!manager) throw new Error("Manager ID or email was not found.");
    const company = companies.find((entry) => entry.id === manager.companyId);
    if (!company) throw new Error("This manager is not linked to a company.");
    return saveSession("manager", {
      ...manager,
      role: "Manager",
      companyId: company.id,
      companyName: company.name,
    });
  }

  const users = await readCollection("users");
  if (role === "worker") {
    const worker = users.find((entry) =>
      entry.role === "Worker" && [entry.id, entry.email].some((value) => normalize(value) === key),
    );
    if (!worker) throw new Error("Worker ID or email was not found.");
    return saveSession("worker", worker);
  }

  const auditor = users.find((entry) =>
    entry.role === "Auditor" &&
    [entry.id, entry.facilityId, entry.email].some((value) => normalize(value) === key),
  );
  if (!auditor) throw new Error("Destination facility ID or auditor email was not found.");
  const facilities = await readCollection("facilities");
  const facility = facilities.find((entry) => entry.id === (auditor.facilityId || auditor.id));
  if (!facility) throw new Error("No destination facility is linked to this auditor.");
  return saveSession("auditor", {
    ...auditor,
    facilityId: facility.id,
    facilityName: facility.name,
    facilityType: facility.type || facility.facilityType,
  });
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

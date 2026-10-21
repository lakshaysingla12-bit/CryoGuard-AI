import { api } from "./client.js";

export const getUsers = () => api("/users");
export const addUser = (user) => api("/users", { method: "POST", body: user });
export const updateUser = (id, user) => api(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body: user });
export const deleteUser = (id) => api(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });

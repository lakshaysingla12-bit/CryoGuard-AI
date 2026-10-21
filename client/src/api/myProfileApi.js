import { api } from "./client.js";

export async function getMyProfile() {
  return api("/myProfile");
}

export async function updateMyProfile(profile) {
  return api(`/myProfile/${encodeURIComponent(profile.id)}`, { method: "PATCH", body: profile });
}

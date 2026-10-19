const API_URL = "/api/myProfile";

export async function getMyProfile() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Profile request failed: ${response.status}`);
  }

  const profiles = await response.json();
  return Array.isArray(profiles) ? profiles[0] : profiles;
}

export async function updateMyProfile(profile) {
  const response = await fetch(`${API_URL}/${profile.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error(`Profile save failed: ${response.status}`);
  }

  return response.json();
}

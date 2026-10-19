const API_URL = "/api/users";

export async function getUsers() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Users load nahi ho paaye.");
  return response.json();
}

export async function addUser(user) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error("User add nahi ho paaya.");
  return response.json();
}

export async function updateUser(id, user) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error("User update nahi ho paaya.");
  return response.json();
}

export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("User delete nahi ho paaya.");
}

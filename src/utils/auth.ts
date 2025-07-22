export function isAuthenticated() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") !== null;
  }
  return false;
}

export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

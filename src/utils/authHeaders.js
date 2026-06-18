export function getAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  let storedToken = localStorage.getItem("auth_token");

  if (storedToken) {
    storedToken = storedToken.trim();
    if (storedToken && storedToken !== "authenticated") {
      headers.Authorization = `Bearer ${storedToken}`;
    }
  }

  return headers;
}

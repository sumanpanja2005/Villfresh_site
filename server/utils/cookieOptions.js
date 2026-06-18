export function getCookieOptions(overrides = {}) {
  const frontendUrl = process.env.FRONTEND_URL || "";
  const useSecure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.NODE_ENV === "production" &&
      frontendUrl.startsWith("https://"));

  return {
    httpOnly: true,
    secure: useSecure,
    sameSite: useSecure ? "None" : "Lax",
    path: "/",
    ...overrides,
  };
}

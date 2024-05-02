/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/auth/new-verification",
  "/cart",
  "/checkout",
  "/courses",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/";

/**
 * The prefix for Course routes
 * Routes that start with this prefix are used for Course management purposes
 * @type {string}
 */
export const coursePrefix = "/course/";

/**
 * The prefix for Admin Dashboard routes
 * Routes that start with this prefix are used for Admin Dashboard purposes
 * @type {string}
 */
export const adminRoutePrefix = "/admin";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/admin/dashboard";

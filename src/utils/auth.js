// Get authentication token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated (has both token and user)
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

// Logout user (clear localStorage)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.reload(); // Reload to reset app state
};

// Create headers with auth token for API calls
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export function getFriendlyErrorMessage(error, fallbackMessage = "Something went wrong.") {
  const status = Number(error?.response?.status || 0);
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "";

  if (status === 401) {
    return "Your session expired or you are not logged in. Please sign in and try again.";
  }

  if (status === 403) {
    return apiMessage || "Access denied. You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource was not found. It may have been removed or moved.";
  }

  if (status === 409) {
    return apiMessage || "This action conflicts with existing data.";
  }

  if (status >= 500) {
    return "Server error occurred. Please try again in a moment.";
  }

  return apiMessage || fallbackMessage;
}

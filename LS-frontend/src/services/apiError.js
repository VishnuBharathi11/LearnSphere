export function getFriendlyErrorMessage(error, fallbackMessage = "Something went wrong.") {
  const status = Number(error?.response?.status || 0);
  const responseData = error?.response?.data;
  const apiMessage =
    (typeof responseData === "string" ? responseData : "") ||
    responseData?.message ||
    responseData?.error ||
    "";

  if (!status) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  if (status === 400) {
    return apiMessage || fallbackMessage;
  }

  if (status === 401) {
    return fallbackMessage || "Please sign in and try again.";
  }

  if (status === 403) {
    return apiMessage || fallbackMessage || "You are not allowed to perform this action.";
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

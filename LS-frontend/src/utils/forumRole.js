export const normalizeForumRole = (rawRole) => {
  const role = String(rawRole || "").trim().toLowerCase();

  if (role.includes("instructor") || role.includes("teacher")) {
    return "instructor";
  }

  if (role.includes("admin")) {
    return "admin";
  }

  if (role.includes("learner") || role.includes("student")) {
    return "learner";
  }

  return "learner";
};

export const getForumRoleLabel = (rawRole) => normalizeForumRole(rawRole);

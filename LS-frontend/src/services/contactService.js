export function saveContactSubmission(submission) {
  const submissions = getContactSubmissions();
  submissions.push({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...submission
  });
  localStorage.setItem("learnsphere_contact_submissions", JSON.stringify(submissions));
}

export function getContactSubmissions() {
  try {
    const raw = localStorage.getItem("learnsphere_contact_submissions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteContactSubmission(id) {
  const submissions = getContactSubmissions();
  const filtered = submissions.filter((s) => s.id !== id);
  localStorage.setItem("learnsphere_contact_submissions", JSON.stringify(filtered));
}

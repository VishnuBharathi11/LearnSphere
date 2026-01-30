const instructors = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  name: `Instructor ${i + 1}`,
  role: [
    "Senior Frontend Engineer",
    "Backend Architect",
    "Data Science Mentor",
    "AI Researcher",
    "Cloud Engineer",
    "Mobile Specialist",
  ][i % 6],
  expertise: ["React", "Node.js", "Python", "ML", "DevOps", "UI/UX"][i % 6],
  image: `https://i.pravatar.cc/300?img=${i + 10}`,
  socials: {
    linkedin: "https://linkedin.com",
    github: i % 2 === 0 ? "https://github.com" : null,
    twitter: i % 3 === 0 ? "https://twitter.com" : null,
  },
}));

export default instructors;

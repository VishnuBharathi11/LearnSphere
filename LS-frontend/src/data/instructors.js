const curators = [
  {
    id: 1,
    name: "Dr. Angela Chen",
    role: "Senior Frontend Architect",
    expertise: "React",
    image: "https://i.pravatar.cc/300?img=47",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: 2,
    name: "Marcus Thorne",
    role: "Principal Systems Engineer",
    expertise: "Node.js",
    image: "https://i.pravatar.cc/300?img=12",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: null,
    },
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Lead Data Scientist",
    expertise: "Python",
    image: "https://i.pravatar.cc/300?img=49",
    socials: {
      linkedin: "https://linkedin.com",
      github: null,
      twitter: "https://twitter.com",
    },
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    role: "Design Director",
    expertise: "UI/UX",
    image: "https://i.pravatar.cc/300?img=32",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: null,
    },
  },
  {
    id: 5,
    name: "David Vance",
    role: "Cloud Security Specialist",
    expertise: "DevOps",
    image: "https://i.pravatar.cc/300?img=33",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: 6,
    name: "Dr. Alan Miller",
    role: "AI Research Scientist",
    expertise: "ML",
    image: "https://i.pravatar.cc/300?img=68",
    socials: {
      linkedin: "https://linkedin.com",
      github: null,
      twitter: "https://twitter.com",
    },
  },
];

const instructors = Array.from({ length: 50 }).map((_, i) => {
  const base = curators[i % curators.length];
  return {
    id: i + 1,
    name: i < curators.length ? base.name : `${base.name} (${Math.floor(i / curators.length) + 1})`,
    role: base.role,
    expertise: base.expertise,
    image: `https://i.pravatar.cc/300?img=${(i + 15) % 70}`,
    socials: {
      linkedin: "https://linkedin.com",
      github: i % 2 === 0 ? "https://github.com" : null,
      twitter: i % 3 === 0 ? "https://twitter.com" : null,
    },
  };
});

export default instructors;

const IMAGE_URL = "https://imgs.search.brave.com/YTm922W8Y-ysy2I_0nBPQFFXH_OzOmc5XHawvy7F17U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTUw/MDI4NTkyNy9waG90/by95b3VuZy13b21h/bi1hLXVuaXZlcnNp/dHktc3R1ZGVudC1z/dHVkeWluZy1vbmxp/bmUuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPXl2RkRuWU1O/RUo2V0VEWXJBYU9P/TFh2LUpodHY2VmlC/UlhTekpoTDlTX2s9";

const courses = [
  { id: 1, courseName: "Modern JavaScript from the Beginning", instructor: "Sarah Smith", category: "Web Development", level: "Beginner", rating: 4.8, price: 599, lessons: 24, image: IMAGE_URL },
  { id: 2, courseName: "Advanced JavaScript Concepts", instructor: "John Doe", category: "Web Development", level: "Advanced", rating: 3.8, price: 799, lessons: 30, image: IMAGE_URL },
  { id: 3, courseName: "HTML & CSS Masterclass", instructor: "Emily Brown", category: "Web Development", level: "Beginner", rating: 4.7, price: 499, lessons: 20, image: IMAGE_URL },
  { id: 4, courseName: "React for Beginners", instructor: "Michael Lee", category: "Web Development", level: "Beginner", rating: 4.8, price: 699, lessons: 28, image: IMAGE_URL },
  { id: 5, courseName: "React Advanced Patterns", instructor: "Michael Lee", category: "Web Development", level: "Advanced", rating: 4.6, price: 899, lessons: 32, image: IMAGE_URL },

  { id: 6, courseName: "UI/UX Design with Figma", instructor: "Anna Wilson", category: "UI/UX Design", level: "Intermediate", rating: 4.7, price: 699, lessons: 18, image: IMAGE_URL },
  { id: 7, courseName: "UX Research Fundamentals", instructor: "Anna Wilson", category: "UI/UX Design", level: "Beginner", rating: 4.5, price: 499, lessons: 15, image: IMAGE_URL },
  { id: 8, courseName: "Design Systems for UI", instructor: "Anna Wilson", category: "UI/UX Design", level: "Advanced", rating: 4.6, price: 899, lessons: 22, image: IMAGE_URL },

  { id: 9, courseName: "Python for Data Analysis", instructor: "James Johnson", category: "Data Science", level: "Beginner", rating: 4.8, price: 799, lessons: 26, image: IMAGE_URL },
  { id: 10, courseName: "Data Science with Python", instructor: "James Johnson", category: "Data Science", level: "Intermediate", rating: 4.7, price: 899, lessons: 30, image: IMAGE_URL },
  { id: 11, courseName: "Machine Learning A–Z", instructor: "James Johnson", category: "Data Science", level: "Advanced", rating: 4.6, price: 1099, lessons: 35, image: IMAGE_URL },

  { id: 12, courseName: "React Native Mobile Apps", instructor: "John Doe", category: "Mobile Development", level: "Intermediate", rating: 4.7, price: 838, lessons: 24, image: IMAGE_URL },
  { id: 13, courseName: "Flutter & Dart Complete Guide", instructor: "Emily Brown", category: "Mobile Development", level: "Beginner", rating: 4.6, price: 799, lessons: 28, image: IMAGE_URL },
  { id: 14, courseName: "Android App Development", instructor: "David Clark", category: "Mobile Development", level: "Advanced", rating: 4.5, price: 999, lessons: 32, image: IMAGE_URL },

  { id: 15, courseName: "Artificial Intelligence Basics", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Beginner", rating: 4.4, price: 699, lessons: 20, image: IMAGE_URL },
  { id: 16, courseName: "Deep Learning with TensorFlow", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Advanced", rating: 4.6, price: 1199, lessons: 36, image: IMAGE_URL },

  { id: 17, courseName: "Cybersecurity Fundamentals", instructor: "David Clark", category: "Cybersecurity", level: "Beginner", rating: 4.7, price: 599, lessons: 16, image: IMAGE_URL },
  { id: 18, courseName: "Ethical Hacking Bootcamp", instructor: "David Clark", category: "Cybersecurity", level: "Advanced", rating: 3.7, price: 1299, lessons: 40, image: IMAGE_URL },

  { id: 19, courseName: "AWS Cloud Practitioner", instructor: "Michael Lee", category: "Cloud Computing", level: "Beginner", rating: 4.6, price: 899, lessons: 22, image: IMAGE_URL },
  { id: 20, courseName: "DevOps with Docker & Kubernetes", instructor: "Michael Lee", category: "DevOps", level: "Advanced", rating: 4.7, price: 1199, lessons: 34, image: IMAGE_URL },

  { id: 21, courseName: "Node.js Backend Development", instructor: "John Doe", category: "Web Development", level: "Intermediate", rating: 4.6, price: 799, lessons: 27, image: IMAGE_URL },
  { id: 22, courseName: "Express & MongoDB", instructor: "Emily Brown", category: "Web Development", level: "Intermediate", rating: 4.5, price: 849, lessons: 25, image: IMAGE_URL },

  { id: 23, courseName: "SQL for Beginners", instructor: "James Johnson", category: "Data Science", level: "Beginner", rating: 4.4, price: 499, lessons: 18, image: IMAGE_URL },
  { id: 24, courseName: "Power BI Dashboard Design", instructor: "Sarah Smith", category: "Data Science", level: "Intermediate", rating: 4.6, price: 699, lessons: 20, image: IMAGE_URL },
  { id: 25, courseName: "Tableau Visualization", instructor: "Michael Lee", category: "Data Science", level: "Advanced", rating: 4.7, price: 999, lessons: 26, image: IMAGE_URL },

  { id: 26, courseName: "iOS App Development with Swift", instructor: "David Clark", category: "Mobile Development", level: "Advanced", rating: 4.6, price: 1099, lessons: 34, image: IMAGE_URL },
  { id: 27, courseName: "UI Animation Basics", instructor: "Anna Wilson", category: "UI/UX Design", level: "Intermediate", rating: 4.5, price: 599, lessons: 16, image: IMAGE_URL },
  { id: 28, courseName: "Product Design Fundamentals", instructor: "Anna Wilson", category: "UI/UX Design", level: "Beginner", rating: 4.4, price: 499, lessons: 14, image: IMAGE_URL },

  { id: 29, courseName: "AI for Everyone", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Beginner", rating: 4.5, price: 599, lessons: 18, image: IMAGE_URL },
  { id: 30, courseName: "NLP with Python", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Advanced", rating: 4.7, price: 1099, lessons: 30, image: IMAGE_URL },

  { id: 31, courseName: "Network Security", instructor: "David Clark", category: "Cybersecurity", level: "Intermediate", rating: 4.6, price: 899, lessons: 28, image: IMAGE_URL },
  { id: 32, courseName: "Cloud Security Basics", instructor: "James Johnson", category: "Cybersecurity", level: "Beginner", rating: 4.5, price: 699, lessons: 20, image: IMAGE_URL },

  { id: 33, courseName: "Linux Administration", instructor: "Michael Lee", category: "DevOps", level: "Beginner", rating: 4.4, price: 599, lessons: 18, image: IMAGE_URL },
  { id: 34, courseName: "CI/CD Pipelines", instructor: "Michael Lee", category: "DevOps", level: "Advanced", rating: 4.6, price: 999, lessons: 26, image: IMAGE_URL },

  { id: 35, courseName: "Git & GitHub Mastery", instructor: "John Doe", category: "Web Development", level: "Beginner", rating: 4.8, price: 399, lessons: 15, image: IMAGE_URL },
  { id: 36, courseName: "TypeScript Essentials", instructor: "Emily Brown", category: "Web Development", level: "Intermediate", rating: 4.6, price: 699, lessons: 22, image: IMAGE_URL },

  { id: 37, courseName: "Firebase for Web Apps", instructor: "Sarah Smith", category: "Web Development", level: "Intermediate", rating: 4.5, price: 649, lessons: 20, image: IMAGE_URL },
  { id: 38, courseName: "Next.js Framework", instructor: "Michael Lee", category: "Web Development", level: "Advanced", rating: 4.7, price: 899, lessons: 26, image: IMAGE_URL },

  { id: 39, courseName: "Big Data Fundamentals", instructor: "James Johnson", category: "Data Science", level: "Beginner", rating: 4.4, price: 699, lessons: 20, image: IMAGE_URL },
  { id: 40, courseName: "Apache Spark", instructor: "James Johnson", category: "Data Science", level: "Advanced", rating: 4.6, price: 1099, lessons: 28, image: IMAGE_URL },

  { id: 41, courseName: "Prompt Engineering", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Intermediate", rating: 4.7, price: 799, lessons: 16, image: IMAGE_URL },
  { id: 42, courseName: "ChatGPT & AI Tools", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Beginner", rating: 4.8, price: 599, lessons: 14, image: IMAGE_URL },

  { id: 43, courseName: "Ethical AI", instructor: "Anna Wilson", category: "Artificial Intelligence", level: "Intermediate", rating: 4.5, price: 699, lessons: 18, image: IMAGE_URL },
  { id: 44, courseName: "Kotlin for Android", instructor: "David Clark", category: "Mobile Development", level: "Intermediate", rating: 4.6, price: 799, lessons: 25, image: IMAGE_URL },

  { id: 45, courseName: "Cross Platform Apps", instructor: "Emily Brown", category: "Mobile Development", level: "Advanced", rating: 4.5, price: 999, lessons: 30, image: IMAGE_URL },
  { id: 46, courseName: "Blockchain Basics", instructor: "James Johnson", category: "Blockchain", level: "Beginner", rating: 4.4, price: 699, lessons: 18, image: IMAGE_URL },
  { id: 47, courseName: "Solidity Smart Contracts", instructor: "James Johnson", category: "Blockchain", level: "Advanced", rating: 4.6, price: 1099, lessons: 28, image: IMAGE_URL },
  { id: 48, courseName: "Web3 Development", instructor: "Michael Lee", category: "Blockchain", level: "Intermediate", rating: 4.5, price: 899, lessons: 24, image: IMAGE_URL },

  { id: 49, courseName: "System Design Fundamentals", instructor: "David Clark", category: "Software Engineering", level: "Advanced", rating: 4.7, price: 1199, lessons: 30, image: IMAGE_URL },
  { id: 50, courseName: "Clean Code Principles", instructor: "Sarah Smith", category: "Software Engineering", level: "Intermediate", rating: 4.8, price: 799, lessons: 22, image: IMAGE_URL }
];

export default courses;

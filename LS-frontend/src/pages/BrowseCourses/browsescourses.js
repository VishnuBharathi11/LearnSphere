const courses = [
  { id: 1, courseName: "Modern JavaScript from the Beginning", instructor: "Sarah Smith", category: "Web Development", level: "Beginner", rating: 4.8, price: 599, lessons: 24, image: "/images/js.jpg" },
  { id: 2, courseName: "Advanced JavaScript Concepts", instructor: "John Doe", category: "Web Development", level: "Advanced", rating: 3.8, price: 799, lessons: 30, image: "/images/js-advanced.jpg" },
  { id: 3, courseName: "HTML & CSS Masterclass", instructor: "Emily Brown", category: "Web Development", level: "Beginner", rating: 4.7, price: 499, lessons: 20, image: "/images/html-css.jpg" },
  { id: 4, courseName: "React for Beginners", instructor: "Michael Lee", category: "Web Development", level: "Beginner", rating: 4.8, price: 699, lessons: 28, image: "/images/react.jpg" },
  { id: 5, courseName: "React Advanced Patterns", instructor: "Michael Lee", category: "Web Development", level: "Advanced", rating: 4.6, price: 899, lessons: 32, image: "/images/react-advanced.jpg" },

  { id: 6, courseName: "UI/UX Design with Figma", instructor: "Anna Wilson", category: "UI/UX Design", level: "Intermediate", rating: 4.7, price: 699, lessons: 18, image: "/images/figma.jpg" },
  { id: 7, courseName: "UX Research Fundamentals", instructor: "Anna Wilson", category: "UI/UX Design", level: "Beginner", rating: 4.5, price: 499, lessons: 15, image: "/images/ux.jpg" },
  { id: 8, courseName: "Design Systems for UI", instructor: "Anna Wilson", category: "UI/UX Design", level: "Advanced", rating: 4.6, price: 899, lessons: 22, image: "/images/design-system.jpg" },

  { id: 9, courseName: "Python for Data Analysis", instructor: "James Johnson", category: "Data Science", level: "Beginner", rating: 4.8, price: 799, lessons: 26, image: "/images/python.jpg" },
  { id: 10, courseName: "Data Science with Python", instructor: "James Johnson", category: "Data Science", level: "Intermediate", rating: 4.7, price: 899, lessons: 30, image: "/images/data-science.jpg" },
  { id: 11, courseName: "Machine Learning A–Z", instructor: "James Johnson", category: "Data Science", level: "Advanced", rating: 4.6, price: 1099, lessons: 35, image: "/images/ml.jpg" },

  { id: 12, courseName: "React Native Mobile Apps", instructor: "John Doe", category: "Mobile Development", level: "Intermediate", rating: 4.7, price: 838, lessons: 24, image: "/images/react-native.jpg" },
  { id: 13, courseName: "Flutter & Dart Complete Guide", instructor: "Emily Brown", category: "Mobile Development", level: "Beginner", rating: 4.6, price: 799, lessons: 28, image: "/images/flutter.jpg" },
  { id: 14, courseName: "Android App Development", instructor: "David Clark", category: "Mobile Development", level: "Advanced", rating: 4.5, price: 999, lessons: 32, image: "/images/android.jpg" },

  { id: 15, courseName: "Artificial Intelligence Basics", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Beginner", rating: 4.4, price: 699, lessons: 20, image: "/images/ai.jpg" },
  { id: 16, courseName: "Deep Learning with TensorFlow", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Advanced", rating: 4.6, price: 1199, lessons: 36, image: "/images/deep-learning.jpg" },

  { id: 17, courseName: "Cybersecurity Fundamentals", instructor: "David Clark", category: "Cybersecurity", level: "Beginner", rating: 4.7, price: 599, lessons: 16, image: "/images/cyber.jpg" },
  { id: 18, courseName: "Ethical Hacking Bootcamp", instructor: "David Clark", category: "Cybersecurity", level: "Advanced", rating: 3.7, price: 1299, lessons: 40, image: "/images/hacking.jpg" },

  { id: 19, courseName: "AWS Cloud Practitioner", instructor: "Michael Lee", category: "Cloud Computing", level: "Beginner", rating: 4.6, price: 899, lessons: 22, image: "/images/aws.jpg" },
  { id: 20, courseName: "DevOps with Docker & Kubernetes", instructor: "Michael Lee", category: "DevOps", level: "Advanced", rating: 4.7, price: 1199, lessons: 34, image: "/images/devops.jpg" },

  { id: 21, courseName: "Node.js Backend Development", instructor: "John Doe", category: "Web Development", level: "Intermediate", rating: 4.6, price: 799, lessons: 27, image: "/images/node.jpg" },
  { id: 22, courseName: "Express & MongoDB", instructor: "Emily Brown", category: "Web Development", level: "Intermediate", rating: 4.5, price: 849, lessons: 25, image: "/images/mongodb.jpg" },

  { id: 23, courseName: "SQL for Beginners", instructor: "James Johnson", category: "Data Science", level: "Beginner", rating: 4.4, price: 499, lessons: 18, image: "/images/sql.jpg" },
  { id: 24, courseName: "Power BI Dashboard Design", instructor: "Sarah Smith", category: "Data Science", level: "Intermediate", rating: 4.6, price: 699, lessons: 20, image: "/images/powerbi.jpg" },
  { id: 25, courseName: "Tableau Visualization", instructor: "Michael Lee", category: "Data Science", level: "Advanced", rating: 4.7, price: 999, lessons: 26, image: "/images/tableau.jpg" },

  { id: 26, courseName: "iOS App Development with Swift", instructor: "David Clark", category: "Mobile Development", level: "Advanced", rating: 4.6, price: 1099, lessons: 34, image: "/images/swift.jpg" },
  { id: 27, courseName: "UI Animation Basics", instructor: "Anna Wilson", category: "UI/UX Design", level: "Intermediate", rating: 4.5, price: 599, lessons: 16, image: "/images/animation.jpg" },
  { id: 28, courseName: "Product Design Fundamentals", instructor: "Anna Wilson", category: "UI/UX Design", level: "Beginner", rating: 4.4, price: 499, lessons: 14, image: "/images/product-design.jpg" },

  { id: 29, courseName: "AI for Everyone", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Beginner", rating: 4.5, price: 599, lessons: 18, image: "/images/ai-basic.jpg" },
  { id: 30, courseName: "NLP with Python", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Advanced", rating: 4.7, price: 1099, lessons: 30, image: "/images/nlp.jpg" },

  { id: 31, courseName: "Network Security", instructor: "David Clark", category: "Cybersecurity", level: "Intermediate", rating: 4.6, price: 899, lessons: 28, image: "/images/network-security.jpg" },
  { id: 32, courseName: "Cloud Security Basics", instructor: "James Johnson", category: "Cybersecurity", level: "Beginner", rating: 4.5, price: 699, lessons: 20, image: "/images/cloud-security.jpg" },

  { id: 33, courseName: "Linux Administration", instructor: "Michael Lee", category: "DevOps", level: "Beginner", rating: 4.4, price: 599, lessons: 18, image: "/images/linux.jpg" },
  { id: 34, courseName: "CI/CD Pipelines", instructor: "Michael Lee", category: "DevOps", level: "Advanced", rating: 4.6, price: 999, lessons: 26, image: "/images/cicd.jpg" },

  { id: 35, courseName: "Git & GitHub Mastery", instructor: "John Doe", category: "Web Development", level: "Beginner", rating: 4.8, price: 399, lessons: 15, image: "/images/git.jpg" },
  { id: 36, courseName: "TypeScript Essentials", instructor: "Emily Brown", category: "Web Development", level: "Intermediate", rating: 4.6, price: 699, lessons: 22, image: "/images/typescript.jpg" },

  { id: 37, courseName: "Firebase for Web Apps", instructor: "Sarah Smith", category: "Web Development", level: "Intermediate", rating: 4.5, price: 649, lessons: 20, image: "/images/firebase.jpg" },
  { id: 38, courseName: "Next.js Framework", instructor: "Michael Lee", category: "Web Development", level: "Advanced", rating: 4.7, price: 899, lessons: 26, image: "/images/nextjs.jpg" },

  { id: 39, courseName: "Big Data Fundamentals", instructor: "James Johnson", category: "Data Science", level: "Beginner", rating: 4.4, price: 699, lessons: 20, image: "/images/bigdata.jpg" },
  { id: 40, courseName: "Apache Spark", instructor: "James Johnson", category: "Data Science", level: "Advanced", rating: 4.6, price: 1099, lessons: 28, image: "/images/spark.jpg" },

  { id: 41, courseName: "Prompt Engineering", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Intermediate", rating: 4.7, price: 799, lessons: 16, image: "/images/prompt.jpg" },
  { id: 42, courseName: "ChatGPT & AI Tools", instructor: "Sophia Miller", category: "Artificial Intelligence", level: "Beginner", rating: 4.8, price: 599, lessons: 14, image: "/images/chatgpt.jpg" },

  { id: 43, courseName: "Ethical AI", instructor: "Anna Wilson", category: "Artificial Intelligence", level: "Intermediate", rating: 4.5, price: 699, lessons: 18, image: "/images/ethical-ai.jpg" },
  { id: 44, courseName: "Kotlin for Android", instructor: "David Clark", category: "Mobile Development", level: "Intermediate", rating: 4.6, price: 799, lessons: 25, image: "/images/kotlin.jpg" },

  { id: 45, courseName: "Cross Platform Apps", instructor: "Emily Brown", category: "Mobile Development", level: "Advanced", rating: 4.5, price: 999, lessons: 30, image: "/images/cross-platform.jpg" },
  { id: 46, courseName: "Blockchain Basics", instructor: "James Johnson", category: "Blockchain", level: "Beginner", rating: 4.4, price: 699, lessons: 18, image: "/images/blockchain.jpg" },
  { id: 47, courseName: "Solidity Smart Contracts", instructor: "James Johnson", category: "Blockchain", level: "Advanced", rating: 4.6, price: 1099, lessons: 28, image: "/images/solidity.jpg" },
  { id: 48, courseName: "Web3 Development", instructor: "Michael Lee", category: "Blockchain", level: "Intermediate", rating: 4.5, price: 899, lessons: 24, image: "/images/web3.jpg" },

  { id: 49, courseName: "System Design Fundamentals", instructor: "David Clark", category: "Software Engineering", level: "Advanced", rating: 4.7, price: 1199, lessons: 30, image: "/images/system-design.jpg" },
  { id: 50, courseName: "Clean Code Principles", instructor: "Sarah Smith", category: "Software Engineering", level: "Intermediate", rating: 4.8, price: 799, lessons: 22, image: "/images/clean-code.jpg" }
];

export default courses;

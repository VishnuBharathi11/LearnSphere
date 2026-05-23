// Switch to the correct database learnsphere_db used by the backend services
db = db.getSiblingDB("learnsphere_db");
const now = new Date();

// 1. Find the existing Decentralized Application (DApp) Development course
let dappCourse = db.courses.findOne({ title: "Decentralized Application (DApp) Development" });
let instructorId = "12"; // Match user "Anbu" / existing instructor

if (!dappCourse) {
  // If not found, let's create a category and course as a fallback
  let blockchainCategory = db.categories.findOne({ name: "Blockchain" });
  if (!blockchainCategory) {
    const insertResult = db.categories.insertOne({
      name: "Blockchain",
      description: "Blockchain, Smart Contracts, and Web3 Decentralized Applications",
      active: true,
      createdAt: now
    });
    blockchainCategory = { _id: insertResult.insertedId, name: "Blockchain" };
  }
  
  const insertResult = db.courses.insertOne({
    title: "Decentralized Application (DApp) Development",
    description: "Learn how to build, deploy, and connect production-ready Decentralized Applications (DApps) on the Ethereum blockchain using Solidity, Ethers.js, MetaMask, and IPFS.",
    thumbnail: "",
    price: 999,
    categoryId: String(blockchainCategory._id),
    instructorId: instructorId,
    status: "PUBLISHED",
    createdAt: now,
    updatedAt: now
  });
  dappCourse = db.courses.findOne({ _id: insertResult.insertedId });
  print("Created fallback course in learnsphere_db");
} else {
  instructorId = dappCourse.instructorId || "12";
  print("Found existing course in learnsphere_db: " + dappCourse._id);
}
const courseId = String(dappCourse._id);

// 2. Fetch the actual lessons (course_contents) for this course
let lessons = db.course_contents.find({ courseId: courseId }).sort({ orderIndex: 1 }).toArray();

if (lessons.length === 0) {
  // If no lessons are present, seed the 7 actual lessons as a fallback
  const targetLessons = [
    { title: "Introduction to Blockchain Technology", description: "Core concepts of decentralized ledgers and distributed networks." },
    { title: "Understanding Decentralized Applications (DApps)", description: "Architecture, key differences from web2, and smart contract backends." },
    { title: "Smart Contracts and Their Function", description: "Introduction to self-executing agreements and platforms like Ethereum." },
    { title: "Tools Used for DApp Development", description: "Essential compiler and testing tools like Hardhat, Truffle, and MetaMask." },
    { title: "DApp Development Workflow", description: "Curriculum phases from Solidity code to deployed frontends on testnets." },
    { title: "Security and Best Practices in DApp Development", description: "Preventing exploits like reentrancy and structural contract bugs." },
    { title: "DApp Basics", description: "ABI configurations, Web3 providers, and gas optimizations." }
  ];
  
  targetLessons.forEach((lesson, index) => {
    db.course_contents.insertOne({
      courseId: courseId,
      title: lesson.title,
      description: lesson.description,
      heading: lesson.title,
      subheadings: [],
      type: "pdf",
      fileName: lesson.title.toLowerCase().replace(/\s+/g, "_") + ".pdf",
      fileUrl: "https://learnsphere-storage.s3.amazonaws.com/materials/stub.pdf",
      mimeType: "application/pdf",
      orderIndex: index,
      uploadedAt: now
    });
  });
  lessons = db.course_contents.find({ courseId: courseId }).sort({ orderIndex: 1 }).toArray();
  print("Seeded 7 fallback lessons in learnsphere_db");
} else {
  print(`Found ${lessons.length} existing lessons in learnsphere_db for this course.`);
}

// 3. Clear existing quizzes for this course to avoid duplicates
db.quizzes.deleteMany({ courseId: courseId });
print("Cleared old quizzes for course ID: " + courseId);

// 4. Define precise quiz questions for each of the 7 lessons
const quizTemplates = {
  "Introduction to Blockchain Technology": {
    quizTitle: "Lesson 1 Quiz: Blockchain Technology",
    description: "Validate your knowledge on decentralized ledgers, cryptography, and consensus mechanisms.",
    questions: [
      {
        id: "l1_q1",
        question: "What is the primary characteristic of a blockchain ledger?",
        points: 10,
        options: [
          { text: "It is stored on a single central server with high write speeds", isCorrect: false },
          { text: "It is decentralized, immutable, and cryptographically secured across peer nodes", isCorrect: true },
          { text: "It can be modified at any time by any network administrator", isCorrect: false },
          { text: "It does not require internet connectivity to broadcast transactions", isCorrect: false }
        ]
      },
      {
        id: "l1_q2",
        question: "In a public blockchain network, how is consensus typically reached among nodes?",
        points: 10,
        options: [
          { text: "By a majority vote from a centralized committee", isCorrect: false },
          { text: "Through a consensus mechanism like Proof of Work or Proof of Stake", isCorrect: true },
          { text: "By selecting a random node to govern all validations", isCorrect: false },
          { text: "Through manual email verification of blocks", isCorrect: false }
        ]
      }
    ]
  },
  "Understanding Decentralized Applications (DApps)": {
    quizTitle: "Lesson 2 Quiz: DApp Concepts",
    description: "Assess your understanding of Web3 architecture and client-to-smart-contract connectivity.",
    questions: [
      {
        id: "l2_q1",
        question: "How do DApps differ from traditional centralized web applications regarding their backend execution?",
        points: 10,
        options: [
          { text: "They run on a single local computer without a database", isCorrect: false },
          { text: "Their core backend logic runs on a decentralized blockchain using smart contracts", isCorrect: true },
          { text: "They are hosted on standard SQL database instances like PostgreSQL", isCorrect: false },
          { text: "They only compile when the user starts a session", isCorrect: false }
        ]
      },
      {
        id: "l2_q2",
        question: "What role does the client-side interface (frontend) play in a DApp?",
        points: 10,
        options: [
          { text: "It hosts the smart contract code directly in the browser RAM", isCorrect: false },
          { text: "It allows users to interact with smart contracts via Web3 providers like MetaMask", isCorrect: true },
          { text: "It processes blocks on the blockchain to earn gas fees", isCorrect: false },
          { text: "It replaces the smart contract entirely", isCorrect: false }
        ]
      }
    ]
  },
  "Smart Contracts and Their Function": {
    quizTitle: "Lesson 3 Quiz: Smart Contract Basics",
    description: "Check your grasp of smart contract definitions and Turing-complete blockchain platforms.",
    questions: [
      {
        id: "l3_q1",
        question: "What is a smart contract?",
        points: 10,
        options: [
          { text: "A digital signature of an offline contract document", isCorrect: false },
          { text: "A self-executing computer program with the terms of agreement directly written into code", isCorrect: true },
          { text: "An artificial intelligence assistant that writes legal terms", isCorrect: false },
          { text: "A secure folder in Google Drive", isCorrect: false }
        ]
      },
      {
        id: "l3_q2",
        question: "Which blockchain network pioneered the use of Turing-complete smart contracts?",
        points: 10,
        options: [
          { text: "Bitcoin", isCorrect: false },
          { text: "Ethereum", isCorrect: true },
          { text: "Litecoin", isCorrect: false },
          { text: "Ripple", isCorrect: false }
        ]
      }
    ]
  },
  "Tools Used for DApp Development": {
    quizTitle: "Lesson 4 Quiz: DApp Tools",
    description: "Test your familiarity with Hardhat, Truffle, MetaMask, and compilation workflows.",
    questions: [
      {
        id: "l4_q1",
        question: "Which framework is widely used to compile, test, and deploy Ethereum smart contracts locally?",
        points: 10,
        options: [
          { text: "Visual Studio Code Live Server", isCorrect: false },
          { text: "Hardhat", isCorrect: true },
          { text: "Postman", isCorrect: false },
          { text: "Node-gyp", isCorrect: false }
        ]
      },
      {
        id: "l4_q2",
        question: "What is the primary function of MetaMask in a DApp ecosystem?",
        points: 10,
        options: [
          { text: "To store heavy frontend media assets like videos", isCorrect: false },
          { text: "To serve as a cryptographic wallet and a Web3 provider to interact with the blockchain", isCorrect: true },
          { text: "To host Solidity files on-chain", isCorrect: false },
          { text: "To manage CSS styles for React components", isCorrect: false }
        ]
      }
    ]
  },
  "DApp Development Workflow": {
    quizTitle: "Lesson 5 Quiz: Development Workflow",
    description: "Verify your understanding of write-test-deploy cycles in Web3 applications.",
    questions: [
      {
        id: "l5_q1",
        question: "What is the correct logical sequence of phases in the DApp development lifecycle?",
        points: 10,
        options: [
          { text: "Deploy to Mainnet -> Write contract -> Connect Frontend", isCorrect: false },
          { text: "Write contract -> Test locally -> Deploy to Testnet -> Connect Frontend -> Deploy to Mainnet", isCorrect: true },
          { text: "Connect Frontend -> Test on Mainnet -> Compile Solidity", isCorrect: false },
          { text: "Deploy to Testnet -> Deploy to Mainnet -> Test locally", isCorrect: false }
        ]
      },
      {
        id: "l5_q2",
        question: "Why is testing smart contracts thoroughly before deployment highly critical compared to centralized web applications?",
        points: 10,
        options: [
          { text: "Because smart contracts take hours to run on local terminals", isCorrect: false },
          { text: "Because smart contracts are immutable once deployed on the mainnet and cannot be easily patched", isCorrect: true },
          { text: "Because compilers will refuse to deploy any contract with comments", isCorrect: false },
          { text: "Because web servers cannot reload smart contract pages", isCorrect: false }
        ]
      }
    ]
  },
  "Security and Best Practices in DApp Development": {
    quizTitle: "Lesson 6 Quiz: DApp Security",
    description: "Assess your security knowledge including reentrancy vulnerabilities and key management.",
    questions: [
      {
        id: "l6_q1",
        question: "Which of the following is a classic vulnerability where an external contract repeatedly drains funds before the host contract updates its balance?",
        points: 10,
        options: [
          { text: "Stack overflow", isCorrect: false },
          { text: "Reentrancy", isCorrect: true },
          { text: "Deadlock", isCorrect: false },
          { text: "Cross-site scripting", isCorrect: false }
        ]
      },
      {
        id: "l6_q2",
        question: "What is a secure best practice for managing sensitive private keys during contract deployment?",
        points: 10,
        options: [
          { text: "Hardcoding them directly into the deployment configuration files", isCorrect: false },
          { text: "Storing them in environment variables or using secure hardware wallets, never tracking them in Git", isCorrect: true },
          { text: "Saving them in the public git repository for backup", isCorrect: false },
          { text: "Using standard plaintext txt files on the desktop", isCorrect: false }
        ]
      }
    ]
  },
  "DApp Basics": {
    quizTitle: "Lesson 7 Quiz: DApp Core Basics",
    description: "Check your knowledge of ABIs, providers, and blockchain gas mechanisms.",
    questions: [
      {
        id: "l7_q1",
        question: "What does an ABI (Application Binary Interface) contain?",
        points: 10,
        options: [
          { text: "The encrypted user password", isCorrect: false },
          { text: "A JSON schema of the smart contract's functions, inputs, outputs, and events to let the frontend communicate with it", isCorrect: true },
          { text: "The compiled contract bytecode directly", isCorrect: false },
          { text: "A list of valid testnet RPC nodes", isCorrect: false }
        ]
      },
      {
        id: "l7_q2",
        question: "What is the fee paid to execute a transaction or smart contract on the Ethereum blockchain called?",
        points: 10,
        options: [
          { text: "Brokerage commission", isCorrect: false },
          { text: "Gas fee", isCorrect: true },
          { text: "API toll", isCorrect: false },
          { text: "Server rent", isCorrect: false }
        ]
      }
    ]
  }
};

// 5. Generate and Insert Quiz for each lesson in MongoDB
lessons.forEach((lesson) => {
  const title = lesson.title || "";
  const lessonId = String(lesson._id);
  const spec = quizTemplates[title] || {
    quizTitle: `Quiz: ${title}`,
    description: `Assess your knowledge of ${title}.`,
    questions: [
      {
        id: `${lessonId}_q1`,
        question: `What is the core focus of the lesson "${title}"?`,
        points: 10,
        options: [
          { text: "To understand centralized architectures", isCorrect: false },
          { text: "To master the fundamental blockchain/Web3 principles discussed in the curriculum", isCorrect: true },
          { text: "To study standard relational database schemas", isCorrect: false },
          { text: "To write simple HTML text blocks", isCorrect: false }
        ]
      },
      {
        id: `${lessonId}_q2`,
        question: `Which of the following is a primary takeaway from "${title}"?`,
        points: 10,
        options: [
          { text: "Local storage is safer than decentralized protocols", isCorrect: false },
          { text: "Web3 tools and smart contracts form the base of decentralized logic", isCorrect: true },
          { text: "No testing is required for web3 logic", isCorrect: false },
          { text: "Blockchain operates under a single command server", isCorrect: false }
        ]
      }
    ]
  };

  db.quizzes.insertOne({
    courseId: courseId,
    instructorId: instructorId,
    quizTitle: spec.quizTitle,
    description: spec.description,
    assessmentType: "LESSON",
    lessonId: lessonId,
    lessonTitle: lesson.title,
    passingScore: 60,
    timeLimit: 15,
    questions: spec.questions,
    createdAt: now,
    updatedAt: now
  });
  print(`Created Lesson Quiz for Lesson ID ${lessonId}: ${spec.quizTitle}`);
});

// 6. Create and Seed the Final Capstone Assessment in MongoDB
db.quizzes.insertOne({
  courseId: courseId,
  instructorId: instructorId,
  quizTitle: "Decentralized Application (DApp) Development Final Exam",
  description: "Test your complete mastery of building and deploying Decentralized Applications, including Solidity contracts, security, client integration, and decentralized hosting.",
  assessmentType: "FINAL",
  passingScore: 60,
  timeLimit: 30,
  questions: [
    {
      id: "f_q1",
      question: "Which feature makes a Decentralized Application (DApp) highly resilient compared to a centralized application?",
      points: 10,
      options: [
        { text: "It runs on a single AWS instance", isCorrect: false },
        { text: "It is peer-to-peer and lacks a central point of failure, running across a distributed network of nodes", isCorrect: true },
        { text: "It is built using plain HTML and CSS", isCorrect: false },
        { text: "It does not connect to any internet services", isCorrect: false }
      ]
    },
    {
      id: "f_q2",
      question: "In Ethereum, what is the purpose of 'Gas'?",
      points: 10,
      options: [
        { text: "To increase the transaction speed without cost", isCorrect: false },
        { text: "To allocate network storage dynamically to non-users", isCorrect: false },
        { text: "To measure and pay for the computational resources required to execute transactions and smart contracts", isCorrect: true },
        { text: "To encrypt the user's password in their wallet", isCorrect: false }
      ]
    },
    {
      id: "f_q3",
      question: "What happens when a smart contract execution runs out of gas mid-transaction?",
      points: 10,
      options: [
        { text: "The transaction is committed anyway with partial changes", isCorrect: false },
        { text: "The transaction state changes are completely reverted, but gas consumed up to that point is not refunded", isCorrect: true },
        { text: "The EVM is temporarily disabled", isCorrect: false },
        { text: "The transaction waits until the user pays more gas", isCorrect: false }
      ]
    },
    {
      id: "f_q4",
      question: "Which keyword in a Solidity file specifies the compiler version to use?",
      points: 10,
      options: [
        { text: "import", isCorrect: false },
        { text: "version", isCorrect: false },
        { text: "pragma solidity", isCorrect: true },
        { text: "require", isCorrect: false }
      ]
    },
    {
      id: "f_q5",
      question: "How does a React client-side frontend read the state of a smart contract without making a transaction?",
      points: 10,
      options: [
        { text: "By executing a Solidity 'view' or 'pure' function using a Web3 provider", isCorrect: true },
        { text: "By writing to the contract's blockchain storage", isCorrect: false },
        { text: "By querying a centralized Postgres SQL database", isCorrect: false },
        { text: "By compiling the contract again in the browser", isCorrect: false }
      ]
    },
    {
      id: "f_q6",
      question: "What is MetaMask's primary role in a Web3 application?",
      points: 10,
      options: [
        { text: "To host the smart contract files", isCorrect: false },
        { text: "To serve as a cryptographic wallet and Web3 provider that injects the Ethereum API into the browser context", isCorrect: true },
        { text: "To compile Solidity code into bytecode", isCorrect: false },
        { text: "To speed up the computer's CPU performance", isCorrect: false }
      ]
    },
    {
      id: "f_q7",
      question: "Which of the following is a peer-to-peer hypermedia protocol designed to make the web faster, safer, and more open by storing files in a decentralized manner?",
      points: 10,
      options: [
        { text: "MySQL", isCorrect: false },
        { text: "IPFS (InterPlanetary File System)", isCorrect: true },
        { text: "AWS S3 Bucket", isCorrect: false },
        { text: "HTTP 1.1 Protocol", isCorrect: false }
      ]
    },
    {
      id: "f_q8",
      question: "Which code pattern is highly effective at preventing reentrancy attacks in Solidity?",
      points: 10,
      options: [
        { text: "Checks-Effects-Interactions pattern (modifying internal state before calling external addresses)", isCorrect: true },
        { text: "Calling the external contract first, then checking permissions", isCorrect: false },
        { text: "Removing all state variables from the contract", isCorrect: false },
        { text: "Hosting the contract entirely off-chain", isCorrect: false }
      ]
    },
    {
      id: "f_q9",
      question: "What is an ABI (Application Binary Interface) in Ethereum?",
      points: 10,
      options: [
        { text: "The Solidity compiler itself", isCorrect: false },
        { text: "To define the JSON schema of a smart contract's functions and events to let frontends communicate with it", isCorrect: true },
        { text: "A hardware wallet used to sign transactions", isCorrect: false },
        { text: "A testnet name for Ethereum virtual environments", isCorrect: false }
      ]
    },
    {
      id: "f_q10",
      question: "What is the primary role of a private key in DApp development and transaction signatures?",
      points: 10,
      options: [
        { text: "To encrypt contract files on-chain", isCorrect: false },
        { text: "To cryptographically sign transactions, proving ownership of an address and authorization of the state change", isCorrect: true },
        { text: "To pay for gas fees directly to miners", isCorrect: false },
        { text: "To run EVM commands in local terminals", isCorrect: false }
      ]
    }
  ],
  createdAt: now,
  updatedAt: now
});
print("Created final Capstone Quiz!");

printjson({
  success: true,
  courseId: courseId,
  lessonsCount: db.course_contents.countDocuments({ courseId: courseId }),
  quizzesCount: db.quizzes.countDocuments({ courseId: courseId })
});

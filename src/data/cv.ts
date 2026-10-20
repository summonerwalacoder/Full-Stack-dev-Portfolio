export const CV = {
  name: "Sumit Kumar Sharma",
  wordmark: "SUMIT SHARMA",
  role: "Computer Science Engineering | Artificial Intelligence",
  tagline: "Curious by nature. Building by practice.",
  email: "sumit.sharma.adventureseeker@gmail.com",
  location: "Bareilly, Uttar Pradesh, India",
  links: {
    linkedin: "https://www.linkedin.com/in/sumit-kumar-sharma-81a485383/",
    github: "https://github.com/summonerwalacoder",
    cvFile: "/cv/sumit-kumar-sharma-cv.html",
  },
  education: [
    {
      id: "invertis",
      period: "2025 – present",
      institution: "Invertis University",
      description:
        "B.Tech, Computer Science Engineering — specialisation in Artificial Intelligence.",
    },
    {
      id: "aps",
      period: "2021 – 2022",
      institution: "Army Public School",
      description: "High school.",
    },
    {
      id: "jkg",
      period: "2023 – 2024",
      institution: "JKG International School",
      description: "Intermediate (12th).",
    },
  ],
  skills: {
    programming: ["Python", "C", "SQL", "Java"],
    tools: ["VS Code", "Git", "MySQL", "Excel", "Jupyter Notebook"],
    areas: [
      "Pandas",
      "NumPy",
      "TensorFlow",
      "Machine learning",
      "Deep learning",
      "Analytics",
      "Statistics",
      "Data engineering",
    ],
  },
  achievements: [
    {
      id: "inverthon",
      year: "2026",
      title: "Inverthon 2026 — 8th place, software domain",
      description:
        "Team result for the Smart Crop Advisory System among 50 competing teams at Invertis University. Certificate of Achievement / Participation.",
    },
    {
      id: "hackbhoomi",
      year: "2025",
      title: "HackBhoomi 2025",
      description: "Certificate of Achievement / Participation.",
    },
    {
      id: "quiz",
      year: "High school",
      title: "Inter-school quiz competition",
      description: "Winner.",
    },
  ],
  interests: {
    activities: [
      "Cycling",
      "Reading graphic novels, including The Jungle Book",
      "Technology exploration",
      "Artificial intelligence",
      "Problem-solving",
      "Continuous learning",
    ],
  },
} as const;

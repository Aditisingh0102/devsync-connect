export type Project = {
  id: string;
  title: string;
  owner: string;
  team: string;
  description: string;
  tech: string[];
  roles: string[];
  members: number;
  maxMembers: number;
  progress: number;
  status: "Recruiting" | "In Progress" | "Completed";
  category: string;
  bookmarked?: boolean;
};

export const projects: Project[] = [
  { id: "p1", title: "DevSync Team Match AI", owner: "Aditi Singh", team: "Byte_Forge", description: "AI engine that pairs students by skills, availability, and project goals.", tech: ["React", "FastAPI", "PostgreSQL", "ML"], roles: ["ML Engineer", "Backend Dev"], members: 3, maxMembers: 5, progress: 62, status: "In Progress", category: "AI" },
  { id: "p2", title: "Hackathon Team Formation", owner: "Anshuman", team: "HackLab", description: "Find balanced hackathon teams in minutes with skill-aware matching.", tech: ["Next.js", "Supabase", "Tailwind"], roles: ["Frontend Dev", "Designer"], members: 2, maxMembers: 4, progress: 28, status: "Recruiting", category: "Web" },
  { id: "p3", title: "Campus Connect Live", owner: "Ansh Gupta", team: "Connectors", description: "Live campus events, study rooms, and peer learning sessions.", tech: ["React Native", "Node", "Socket.IO"], roles: ["Mobile Dev", "Backend Dev"], members: 4, maxMembers: 6, progress: 45, status: "In Progress", category: "Mobile" },
  { id: "p4", title: "PeerCode Review Hub", owner: "Ambar Kumar", team: "ReviewPros", description: "Async code review for student projects with mentor feedback.", tech: ["Vue", "Express", "MongoDB"], roles: ["Full Stack", "DevOps"], members: 3, maxMembers: 5, progress: 70, status: "In Progress", category: "DevTools" },
  { id: "p5", title: "HackPrep Planner", owner: "Riya Verma", team: "PrepStart", description: "Structured prep tracker for hackathons with milestone reminders.", tech: ["React", "Firebase"], roles: ["Frontend Dev"], members: 2, maxMembers: 3, progress: 15, status: "Recruiting", category: "Productivity" },
  { id: "p6", title: "Startup Sprint Board", owner: "Karan Mehta", team: "LaunchPad", description: "Lightweight kanban tailored to student startup teams.", tech: ["React", "Tailwind", "TRPC"], roles: ["Full Stack", "PM"], members: 4, maxMembers: 4, progress: 88, status: "In Progress", category: "Productivity" },
  { id: "p7", title: "Final Year Project Collaborator", owner: "Sneha Roy", team: "Capstone", description: "Pair final-year students with complementary skills and guides.", tech: ["Django", "PostgreSQL"], roles: ["Backend Dev", "Researcher"], members: 1, maxMembers: 4, progress: 8, status: "Recruiting", category: "Research" },
  { id: "p8", title: "OpenSource Onboarding Bot", owner: "Vikas R.", team: "OSSPath", description: "Discord bot that guides students into their first PRs.", tech: ["Node", "Discord.js"], roles: ["Backend Dev"], members: 2, maxMembers: 3, progress: 50, status: "In Progress", category: "OpenSource" },
  { id: "p9", title: "EduStream Notes Sync", owner: "Pooja N.", team: "NoteFlow", description: "Sync lecture notes and timestamps across study groups.", tech: ["React", "Supabase"], roles: ["Frontend Dev", "Designer"], members: 2, maxMembers: 5, progress: 33, status: "Recruiting", category: "Education" },
];

export const skills = ["React", "TypeScript", "Python", "Node.js", "UI/UX", "ML", "DevOps", "Mobile", "Data", "Cloud"];

export type Activity = { id: string; type: string; text: string; time: string };
export const activities: Activity[] = [
  { id: "a1", type: "join", text: "Anshuman joined DevSync Team Match AI", time: "2h ago" },
  { id: "a2", type: "milestone", text: "Sprint 3 completed in PeerCode Review Hub", time: "5h ago" },
  { id: "a3", type: "invite", text: "Ambar invited you to Startup Sprint Board", time: "Yesterday" },
  { id: "a4", type: "task", text: "Aditi closed 4 issues in Campus Connect Live", time: "2d ago" },
];

export type Notification = { id: string; type: "invite" | "project" | "task" | "system"; title: string; body: string; time: string; read: boolean };
export const notifications: Notification[] = [
  { id: "n1", type: "invite", title: "Team invitation", body: "Byte_Forge invited you to join DevSync Team Match AI", time: "10m ago", read: false },
  { id: "n2", type: "project", title: "New milestone", body: "Sprint 3 closed in PeerCode Review Hub", time: "1h ago", read: false },
  { id: "n3", type: "task", title: "Task assigned", body: "Design onboarding flow — due Friday", time: "3h ago", read: false },
  { id: "n4", type: "project", title: "Project update", body: "Campus Connect Live shipped real-time chat", time: "Yesterday", read: true },
  { id: "n5", type: "system", title: "Profile tip", body: "Add 2 more skills to improve match quality", time: "2d ago", read: true },
];

export const team = {
  id: "t1",
  name: "Byte_Forge",
  mission: "Build student-first tools that make collaboration effortless.",
  activeProject: "DevSync Team Match AI",
  sprint: { name: "Sprint 4", progress: 64, daysLeft: 5 },
  members: [
    { name: "Aditi Singh", role: "Team Lead · Full Stack", skills: ["React", "Node", "PM"], avatar: "AS" },
    { name: "Anshuman", role: "ML Engineer", skills: ["Python", "ML", "FastAPI"], avatar: "AN" },
    { name: "Ansh Gupta", role: "Frontend Dev", skills: ["React", "TS", "UI"], avatar: "AG" },
    { name: "Ambar Kumar", role: "Backend Dev", skills: ["Node", "PostgreSQL", "Cloud"], avatar: "AK" },
  ],
  tasks: [
    { id: "t1", title: "Wire matching API", status: "In Progress", assignee: "Anshuman" },
    { id: "t2", title: "Design profile cards", status: "Review", assignee: "Ansh" },
    { id: "t3", title: "Set up CI", status: "Done", assignee: "Ambar" },
    { id: "t4", title: "Onboarding copy", status: "Todo", assignee: "Aditi" },
  ],
  meetings: [
    { title: "Sprint review", time: "Fri 5:00 PM" },
    { title: "Design sync", time: "Wed 7:30 PM" },
  ],
  resources: [
    { title: "Figma — Onboarding v2", url: "#" },
    { title: "Notion — Sprint plan", url: "#" },
    { title: "GitHub — repo", url: "#" },
  ],
};

export const profile = {
  name: "Aditi Singh",
  handle: "@aditi",
  role: "Full Stack Developer · Team Lead",
  college: "IIIT Delhi · B.Tech CSE · Year 3",
  bio: "Building student-first products. Love React, design systems, and shipping fast.",
  skills: ["React", "TypeScript", "Node", "PostgreSQL", "UI/UX", "Figma"],
  stats: { projects: 8, teams: 3, contributions: 142, matchScore: 92 },
  links: { github: "#", linkedin: "#", portfolio: "#" },
  achievements: [
    { name: "First PR", date: "Jan" },
    { name: "5 Projects", date: "Mar" },
    { name: "Team Lead", date: "Jun" },
    { name: "Hackathon Winner", date: "Aug" },
  ],
  contributedProjects: ["DevSync Team Match AI", "Campus Connect Live", "PeerCode Review Hub"],
};

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

export const projects: Project[] = [];

export const skills = ["React", "TypeScript", "Python", "Node.js", "UI/UX", "ML", "DevOps", "Mobile", "Data", "Cloud"];

export type Activity = { id: string; type: string; text: string; time: string };
export const activities: Activity[] = [];

export type Notification = { id: string; type: "invite" | "project" | "task" | "system"; title: string; body: string; time: string; read: boolean };
export const notifications: Notification[] = [];

export const team = {
  id: "",
  name: "",
  mission: "",
  activeProject: "",
  sprint: { name: "", progress: 0, daysLeft: 0 },
  members: [],
  tasks: [],
  meetings: [],
  resources: [],
};

export const profile = {
  name: "",
  handle: "",
  role: "",
  college: "",
  bio: "",
  skills: [],
  stats: { projects: 0, teams: 0, contributions: 0, matchScore: 0 },
  links: { github: "", linkedin: "", portfolio: "" },
  achievements: [],
  contributedProjects: [],
};

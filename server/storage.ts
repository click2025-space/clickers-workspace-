import type {
  Project,
  InsertProject,
  Department,
  InsertDepartment,
  Task,
  InsertTask,
  Member,
  InsertMember,
  Message,
  InsertMessage,
  Settings,
  InsertSettings,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Departments
  getAllDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Members
  getAllMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;

  // Messages
  getAllMessages(): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private departments: Map<string, Department>;
  private tasks: Map<string, Task>;
  private members: Map<string, Member>;
  private messages: Map<string, Message>;
  private settings: Settings;

  constructor() {
    this.projects = new Map();
    this.departments = new Map();
    this.tasks = new Map();
    this.members = new Map();
    this.messages = new Map();
    this.settings = {
      id: randomUUID(),
      workspaceName: "Clickers Workspace",
      theme: "dark",
    };

    this.seedData();
  }

  private seedData() {
    // Seed departments
    const departments: InsertDepartment[] = [
      {
        name: "Design",
        icon: "palette",
        description: "UI/UX design and creative development",
        teamMembers: ["Sarah Johnson", "Mike Chen", "Emma Wilson"],
      },
      {
        name: "Development",
        icon: "code",
        description: "Software engineering and technical implementation",
        teamMembers: ["Alex Rodriguez", "Lisa Park", "James Smith", "Nina Patel"],
      },
      {
        name: "Marketing",
        icon: "megaphone",
        description: "Brand strategy and market growth",
        teamMembers: ["David Lee", "Sophie Turner"],
      },
      {
        name: "Admin",
        icon: "briefcase",
        description: "Operations and administrative support",
        teamMembers: ["Rachel Green", "Tom Anderson"],
      },
    ];

    departments.forEach((dept) => {
      const id = randomUUID();
      this.departments.set(id, { ...dept, id });
    });

    // Seed projects
    const projects: InsertProject[] = [
      {
        name: "Website Redesign",
        description: "Complete overhaul of the company website with modern design",
        progress: 65,
        department: "Design",
        teamMembers: ["Sarah Johnson", "Mike Chen", "Alex Rodriguez"],
      },
      {
        name: "Mobile App Development",
        description: "Native iOS and Android application for our platform",
        progress: 45,
        department: "Development",
        teamMembers: ["Alex Rodriguez", "Lisa Park", "James Smith"],
      },
      {
        name: "Q1 Marketing Campaign",
        description: "Launch campaign for our new product line",
        progress: 80,
        department: "Marketing",
        teamMembers: ["David Lee", "Sophie Turner", "Emma Wilson"],
      },
      {
        name: "Internal Tools Upgrade",
        description: "Modernize internal workflow tools and processes",
        progress: 30,
        department: "Development",
        teamMembers: ["Nina Patel", "James Smith"],
      },
    ];

    projects.forEach((project) => {
      const id = randomUUID();
      this.projects.set(id, { ...project, id });
    });

    // Seed members
    const members: InsertMember[] = [
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@clickers.com",
        role: "Senior Product Designer",
        department: "Design",
        avatar: "",
        status: "online",
      },
      {
        name: "Mike Chen",
        email: "mike.chen@clickers.com",
        role: "UI/UX Designer",
        department: "Design",
        avatar: "",
        status: "online",
      },
      {
        name: "Emma Wilson",
        email: "emma.wilson@clickers.com",
        role: "Graphic Designer",
        department: "Design",
        avatar: "",
        status: "away",
      },
      {
        name: "Alex Rodriguez",
        email: "alex.rodriguez@clickers.com",
        role: "Lead Developer",
        department: "Development",
        avatar: "",
        status: "online",
      },
      {
        name: "Lisa Park",
        email: "lisa.park@clickers.com",
        role: "Frontend Developer",
        department: "Development",
        avatar: "",
        status: "online",
      },
      {
        name: "James Smith",
        email: "james.smith@clickers.com",
        role: "Backend Developer",
        department: "Development",
        avatar: "",
        status: "online",
      },
      {
        name: "Nina Patel",
        email: "nina.patel@clickers.com",
        role: "Full Stack Developer",
        department: "Development",
        avatar: "",
        status: "away",
      },
      {
        name: "David Lee",
        email: "david.lee@clickers.com",
        role: "Marketing Manager",
        department: "Marketing",
        avatar: "",
        status: "online",
      },
      {
        name: "Sophie Turner",
        email: "sophie.turner@clickers.com",
        role: "Content Strategist",
        department: "Marketing",
        avatar: "",
        status: "online",
      },
      {
        name: "Rachel Green",
        email: "rachel.green@clickers.com",
        role: "Office Manager",
        department: "Admin",
        avatar: "",
        status: "online",
      },
      {
        name: "Tom Anderson",
        email: "tom.anderson@clickers.com",
        role: "HR Specialist",
        department: "Admin",
        avatar: "",
        status: "away",
      },
    ];

    members.forEach((member) => {
      const id = randomUUID();
      this.members.set(id, { ...member, id });
    });

    // Seed tasks
    const tasks: InsertTask[] = [
      {
        title: "Design new homepage layout",
        description: "Create wireframes and mockups for the new homepage",
        status: "in-progress",
        assignedTo: "Sarah Johnson",
        dueDate: "2025-11-15",
        projectId: "",
      },
      {
        title: "Implement authentication system",
        description: "Set up user authentication with OAuth",
        status: "in-progress",
        assignedTo: "Alex Rodriguez",
        dueDate: "2025-11-20",
        projectId: "",
      },
      {
        title: "Write product documentation",
        description: "Create comprehensive user guides",
        status: "todo",
        assignedTo: "Sophie Turner",
        dueDate: "2025-11-25",
        projectId: "",
      },
      {
        title: "Code review for mobile app",
        description: "Review and approve pull requests",
        status: "todo",
        assignedTo: "Lisa Park",
        dueDate: "2025-11-18",
        projectId: "",
      },
      {
        title: "Deploy staging environment",
        description: "Set up and configure staging server",
        status: "done",
        assignedTo: "James Smith",
        dueDate: "2025-11-10",
        projectId: "",
      },
      {
        title: "Update brand guidelines",
        description: "Finalize new brand visual identity",
        status: "done",
        assignedTo: "Mike Chen",
        dueDate: "2025-11-08",
        projectId: "",
      },
      {
        title: "Optimize database queries",
        description: "Improve performance of slow queries",
        status: "in-progress",
        assignedTo: "Nina Patel",
        dueDate: "2025-11-22",
        projectId: "",
      },
      {
        title: "Plan social media campaign",
        description: "Create content calendar for Q4",
        status: "todo",
        assignedTo: "David Lee",
        dueDate: "2025-11-30",
        projectId: "",
      },
    ];

    tasks.forEach((task) => {
      const id = randomUUID();
      this.tasks.set(id, { ...task, id });
    });

    // Seed messages
    const memberIds = Array.from(this.members.keys());
    
    const messages: InsertMessage[] = [
      // Global team chat messages
      {
        senderId: memberIds[0] || "member-1",
        receiverId: "global",
        content: "Good morning team! Ready for another productive day!",
        timestamp: "9:00 AM",
      },
      {
        senderId: memberIds[3] || "member-2",
        receiverId: "global",
        content: "Morning! Just deployed the latest updates to staging. Everything looks good!",
        timestamp: "9:15 AM",
      },
      {
        senderId: memberIds[1] || "member-3",
        receiverId: "global",
        content: "Great work team! The new design is coming together nicely.",
        timestamp: "9:30 AM",
      },
      {
        senderId: "current-user",
        receiverId: "global",
        content: "Thanks everyone! Let's keep this momentum going.",
        timestamp: "9:45 AM",
      },
      {
        senderId: memberIds[4] || "member-4",
        receiverId: "global",
        content: "Quick reminder: Team standup at 10 AM in the main conference room!",
        timestamp: "9:50 AM",
      },
      {
        senderId: memberIds[2] || "member-5",
        receiverId: "global",
        content: "I'll be there! Just finishing up some code reviews.",
        timestamp: "9:52 AM",
      },
      {
        senderId: memberIds[6] || "member-6",
        receiverId: "global",
        content: "The Q4 marketing campaign is now live! Check it out on our social channels.",
        timestamp: "10:30 AM",
      },
      
      // 1-on-1 messages with first member
      {
        senderId: memberIds[0] || "member-1",
        receiverId: "current-user",
        content: "Hey! Just finished the new design mockups. Would love your feedback!",
        timestamp: "11:30 AM",
      },
      {
        senderId: "current-user",
        receiverId: memberIds[0] || "member-1",
        content: "Great work! They look fantastic. Can we schedule a review meeting?",
        timestamp: "11:32 AM",
      },
      {
        senderId: memberIds[0] || "member-1",
        receiverId: "current-user",
        content: "Absolutely! How about tomorrow at 2 PM?",
        timestamp: "11:33 AM",
      },
      {
        senderId: "current-user",
        receiverId: memberIds[0] || "member-1",
        content: "Perfect! I'll send out the calendar invite.",
        timestamp: "11:35 AM",
      },
      {
        senderId: memberIds[0] || "member-1",
        receiverId: "current-user",
        content: "Thanks! Looking forward to it.",
        timestamp: "11:36 AM",
      },
    ];

    messages.forEach((message) => {
      const id = randomUUID();
      this.messages.set(id, { ...message, id });
    });
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Departments
  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const department: Department = { ...insertDepartment, id };
    this.departments.set(id, department);
    return department;
  }

  async updateDepartment(id: string, updates: Partial<InsertDepartment>): Promise<Department | undefined> {
    const department = this.departments.get(id);
    if (!department) return undefined;
    const updated = { ...department, ...updates };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Members
  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const member: Member = { ...insertMember, id };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: string, updates: Partial<InsertMember>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;
    const updated = { ...member, ...updates };
    this.members.set(id, updated);
    return updated;
  }

  async deleteMember(id: string): Promise<boolean> {
    return this.members.delete(id);
  }

  // Messages
  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }
}

export const storage = new MemStorage();

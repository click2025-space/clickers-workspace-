import type {
  Project,
  InsertProject,
  Department,
  InsertDepartment,
  Task,
  InsertTask,
  User,
  InsertUser,
  Profile,
  InsertProfile,
  Session,
  InsertSession,
  Member,
  InsertMember,
  Message,
  InsertMessage,
  Settings,
  InsertSettings,
  WorkspaceNote,
  InsertWorkspaceNote,
  WorkspaceFile,
  InsertWorkspaceFile,
  WorkspaceData,
  InsertWorkspaceData,
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

  // Authentication - Users
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Authentication - Profiles
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;

  // Authentication - Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;
  deleteUserSessions(userId: string): Promise<boolean>;

  // Workspace Notes
  getWorkspaceNotes(memberId: string): Promise<WorkspaceNote[]>;
  getWorkspaceNote(id: string): Promise<WorkspaceNote | undefined>;
  createWorkspaceNote(note: InsertWorkspaceNote): Promise<WorkspaceNote>;
  updateWorkspaceNote(id: string, note: Partial<InsertWorkspaceNote>): Promise<WorkspaceNote | undefined>;
  deleteWorkspaceNote(id: string): Promise<boolean>;

  // Workspace Files
  getWorkspaceFiles(memberId: string): Promise<WorkspaceFile[]>;
  getWorkspaceFile(id: string): Promise<WorkspaceFile | undefined>;
  createWorkspaceFile(file: InsertWorkspaceFile): Promise<WorkspaceFile>;
  deleteWorkspaceFile(id: string): Promise<boolean>;

  // Workspace Data
  getWorkspaceData(memberId: string): Promise<WorkspaceData[]>;
  getWorkspaceDataItem(id: string): Promise<WorkspaceData | undefined>;
  createWorkspaceData(data: InsertWorkspaceData): Promise<WorkspaceData>;
  updateWorkspaceData(id: string, data: Partial<InsertWorkspaceData>): Promise<WorkspaceData | undefined>;
  deleteWorkspaceData(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private departments: Map<string, Department>;
  private tasks: Map<string, Task>;
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private sessions: Map<string, Session>;
  private members: Map<string, Member>;
  private messages: Map<string, Message>;
  private settings: Settings;
  private workspaceNotes: Map<string, WorkspaceNote>;
  private workspaceFiles: Map<string, WorkspaceFile>;
  private workspaceData: Map<string, WorkspaceData>;

  constructor() {
    this.projects = new Map();
    this.departments = new Map();
    this.tasks = new Map();
    this.users = new Map();
    this.profiles = new Map();
    this.sessions = new Map();
    this.members = new Map();
    this.messages = new Map();
    this.workspaceNotes = new Map();
    this.workspaceFiles = new Map();
    this.workspaceData = new Map();
    this.settings = {
      id: randomUUID(),
      workspaceName: "Clickers Workspace",
      theme: "dark",
    };

    this.seedData();
  }

  private seedData() {
    // Seed departments with empty team members
    const departments: InsertDepartment[] = [
      {
        name: "Design",
        icon: "palette",
        description: "UI/UX design and creative development",
        teamMembers: [],
      },
      {
        name: "Development",
        icon: "code",
        description: "Software engineering and technical implementation",
        teamMembers: [],
      },
      {
        name: "Marketing",
        icon: "megaphone",
        description: "Brand strategy and market growth",
        teamMembers: [],
      },
      {
        name: "Admin",
        icon: "briefcase",
        description: "Operations and administrative support",
        teamMembers: [],
      },
    ];

    departments.forEach((dept) => {
      const id = randomUUID();
      this.departments.set(id, { ...dept, id });
    });

    // Seed projects with empty team members
    const projects: InsertProject[] = [
      {
        name: "Website Redesign",
        description: "Complete overhaul of the company website with modern design",
        progress: 65,
        department: "Design",
        teamMembers: [],
      },
      {
        name: "Mobile App Development",
        description: "Native iOS and Android application for our platform",
        progress: 45,
        department: "Development",
        teamMembers: [],
      },
      {
        name: "Q1 Marketing Campaign",
        description: "Launch campaign for our new product line",
        progress: 80,
        department: "Marketing",
        teamMembers: [],
      },
      {
        name: "Internal Tools Upgrade",
        description: "Modernize internal workflow tools and processes",
        progress: 30,
        department: "Development",
        teamMembers: [],
      },
    ];

    projects.forEach((project) => {
      const id = randomUUID();
      this.projects.set(id, { ...project, id });
    });

    // No mock members - start with empty member list

    // No mock tasks - start with empty task list

    // No mock messages - start with empty message list
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

  // Workspace Notes
  async getWorkspaceNotes(memberId: string): Promise<WorkspaceNote[]> {
    return Array.from(this.workspaceNotes.values()).filter(note => note.memberId === memberId);
  }

  async getWorkspaceNote(id: string): Promise<WorkspaceNote | undefined> {
    return this.workspaceNotes.get(id);
  }

  async createWorkspaceNote(note: InsertWorkspaceNote): Promise<WorkspaceNote> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newNote: WorkspaceNote = {
      category: "general",
      ...note,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.workspaceNotes.set(id, newNote);
    return newNote;
  }

  async updateWorkspaceNote(id: string, updates: Partial<InsertWorkspaceNote>): Promise<WorkspaceNote | undefined> {
    const note = this.workspaceNotes.get(id);
    if (!note) return undefined;
    const updated = { ...note, ...updates, updatedAt: new Date().toISOString() };
    this.workspaceNotes.set(id, updated);
    return updated;
  }

  async deleteWorkspaceNote(id: string): Promise<boolean> {
    return this.workspaceNotes.delete(id);
  }

  // Workspace Files
  async getWorkspaceFiles(memberId: string): Promise<WorkspaceFile[]> {
    return Array.from(this.workspaceFiles.values()).filter(file => file.memberId === memberId);
  }

  async getWorkspaceFile(id: string): Promise<WorkspaceFile | undefined> {
    return this.workspaceFiles.get(id);
  }

  async createWorkspaceFile(file: InsertWorkspaceFile): Promise<WorkspaceFile> {
    const id = randomUUID();
    const newFile: WorkspaceFile = {
      ...file,
      id,
      uploadedAt: new Date().toISOString(),
    };
    this.workspaceFiles.set(id, newFile);
    return newFile;
  }

  async deleteWorkspaceFile(id: string): Promise<boolean> {
    return this.workspaceFiles.delete(id);
  }

  // Workspace Data
  async getWorkspaceData(memberId: string): Promise<WorkspaceData[]> {
    return Array.from(this.workspaceData.values()).filter(data => data.memberId === memberId);
  }

  async getWorkspaceDataItem(id: string): Promise<WorkspaceData | undefined> {
    return this.workspaceData.get(id);
  }

  async createWorkspaceData(data: InsertWorkspaceData): Promise<WorkspaceData> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newData: WorkspaceData = {
      dataType: "string",
      category: "general",
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.workspaceData.set(id, newData);
    return newData;
  }

  async updateWorkspaceData(id: string, updates: Partial<InsertWorkspaceData>): Promise<WorkspaceData | undefined> {
    const data = this.workspaceData.get(id);
    if (!data) return undefined;
    const updated = { ...data, ...updates, updatedAt: new Date().toISOString() };
    this.workspaceData.set(id, updated);
    return updated;
  }

  async deleteWorkspaceData(id: string): Promise<boolean> {
    return this.workspaceData.delete(id);
  }

  // Authentication - Users
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newUser: User = {
      isVerified: "false",
      ...user,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  // Authentication - Profiles
  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.userId === userId);
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newProfile: Profile = {
      isOnboardingComplete: "false",
      skills: [],
      ...profile,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const profile = Array.from(this.profiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    this.profiles.set(profile.id, updated);
    return updated;
  }

  // Authentication - Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const id = randomUUID();
    const newSession: Session = {
      ...session,
      id,
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(session => session.token === token);
  }

  async deleteSession(token: string): Promise<boolean> {
    const session = Array.from(this.sessions.values()).find(s => s.token === token);
    if (!session) return false;
    return this.sessions.delete(session.id);
  }

  async deleteUserSessions(userId: string): Promise<boolean> {
    const userSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId);
    let deleted = false;
    for (const session of userSessions) {
      if (this.sessions.delete(session.id)) {
        deleted = true;
      }
    }
    return deleted;
  }
}

export const storage = new MemStorage();

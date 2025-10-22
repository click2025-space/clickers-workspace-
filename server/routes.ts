import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  insertProjectSchema,
  insertDepartmentSchema,
  insertTaskSchema,
  insertMemberSchema,
  insertMessageSchema,
  insertSettingsSchema,
  insertWorkspaceNoteSchema,
  insertWorkspaceFileSchema,
  insertWorkspaceDataSchema,
  signUpSchema,
  signInSchema,
  profileSetupSchema,
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = signUpSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const { email, password } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
      });

      // Create empty profile
      const profile = await storage.createProfile({
        userId: user.id,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      res.status(201).json({
        message: "User created successfully",
        user: { id: user.id, email: user.email },
        profile,
        token,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const result = signInSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const { email, password } = result.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get profile
      const profile = await storage.getProfileByUserId(user.id);

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      res.json({
        message: "Sign in successful",
        user: { id: user.id, email: user.email },
        profile,
        token,
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        await storage.deleteSession(token);
      }
      res.json({ message: "Signed out successfully" });
    } catch (error) {
      console.error("Signout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Check session
      const session = await storage.getSessionByToken(token);
      if (!session || new Date(session.expiresAt) < new Date()) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      // Get user and profile
      const user = await storage.getUserById(decoded.userId);
      const profile = await storage.getProfileByUserId(decoded.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: { id: user.id, email: user.email },
        profile,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  });

  app.post("/api/profile/setup", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      const result = profileSetupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const profile = await storage.updateProfile(decoded.userId, {
        ...result.data,
        isOnboardingComplete: "true",
      });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json({ message: "Profile setup completed", profile });
    } catch (error) {
      console.error("Profile setup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Projects
  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid project data", errors: result.error });
    }
    const project = await storage.createProject(result.data);
    res.status(201).json(project);
  });

  app.patch("/api/projects/:id", async (req, res) => {
    const project = await storage.updateProject(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.delete("/api/projects/:id", async (req, res) => {
    const deleted = await storage.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(204).send();
  });

  // Departments
  app.get("/api/departments", async (_req, res) => {
    const departments = await storage.getAllDepartments();
    res.json(departments);
  });

  app.get("/api/departments/:id", async (req, res) => {
    const department = await storage.getDepartment(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  });

  app.post("/api/departments", async (req, res) => {
    const result = insertDepartmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid department data", errors: result.error });
    }
    const department = await storage.createDepartment(result.data);
    res.status(201).json(department);
  });

  app.patch("/api/departments/:id", async (req, res) => {
    const department = await storage.updateDepartment(req.params.id, req.body);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  });

  app.delete("/api/departments/:id", async (req, res) => {
    const deleted = await storage.deleteDepartment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(204).send();
  });

  // Tasks
  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req, res) => {
    const task = await storage.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  });

  app.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid task data", errors: result.error });
    }
    const task = await storage.createTask(result.data);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const task = await storage.updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const deleted = await storage.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(204).send();
  });

  // Members
  app.get("/api/members", async (_req, res) => {
    const members = await storage.getAllMembers();
    res.json(members);
  });

  app.get("/api/members/:id", async (req, res) => {
    const member = await storage.getMember(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  });

  app.post("/api/members", async (req, res) => {
    const result = insertMemberSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid member data", errors: result.error });
    }
    const member = await storage.createMember(result.data);
    res.status(201).json(member);
  });

  app.patch("/api/members/:id", async (req, res) => {
    const member = await storage.updateMember(req.params.id, req.body);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  });

  app.delete("/api/members/:id", async (req, res) => {
    const deleted = await storage.deleteMember(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(204).send();
  });

  // Messages
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getAllMessages();
    res.json(messages);
  });

  app.get("/api/messages/:id", async (req, res) => {
    const message = await storage.getMessage(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json(message);
  });

  app.post("/api/messages", async (req, res) => {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid message data", errors: result.error });
    }
    const message = await storage.createMessage(result.data);
    res.status(201).json(message);
  });

  // Settings
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch("/api/settings", async (req, res) => {
    const result = insertSettingsSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid settings data", errors: result.error });
    }
    const settings = await storage.updateSettings(result.data);
    res.json(settings);
  });

  // Workspace Notes
  app.get("/api/workspace/:memberId/notes", async (req, res) => {
    const notes = await storage.getWorkspaceNotes(req.params.memberId);
    res.json(notes);
  });

  app.get("/api/workspace/notes/:id", async (req, res) => {
    const note = await storage.getWorkspaceNote(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  });

  app.post("/api/workspace/notes", async (req, res) => {
    const result = insertWorkspaceNoteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid note data", errors: result.error });
    }
    const note = await storage.createWorkspaceNote(result.data);
    res.status(201).json(note);
  });

  app.patch("/api/workspace/notes/:id", async (req, res) => {
    const note = await storage.updateWorkspaceNote(req.params.id, req.body);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  });

  app.delete("/api/workspace/notes/:id", async (req, res) => {
    const deleted = await storage.deleteWorkspaceNote(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(204).send();
  });

  // Workspace Files
  app.get("/api/workspace/:memberId/files", async (req, res) => {
    const files = await storage.getWorkspaceFiles(req.params.memberId);
    res.json(files);
  });

  app.get("/api/workspace/files/:id", async (req, res) => {
    const file = await storage.getWorkspaceFile(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json(file);
  });

  app.post("/api/workspace/files", async (req, res) => {
    const result = insertWorkspaceFileSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid file data", errors: result.error });
    }
    const file = await storage.createWorkspaceFile(result.data);
    res.status(201).json(file);
  });

  app.delete("/api/workspace/files/:id", async (req, res) => {
    const deleted = await storage.deleteWorkspaceFile(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(204).send();
  });

  // Workspace Data
  app.get("/api/workspace/:memberId/data", async (req, res) => {
    const data = await storage.getWorkspaceData(req.params.memberId);
    res.json(data);
  });

  app.get("/api/workspace/data/:id", async (req, res) => {
    const data = await storage.getWorkspaceDataItem(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.json(data);
  });

  app.post("/api/workspace/data", async (req, res) => {
    const result = insertWorkspaceDataSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid data", errors: result.error });
    }
    const data = await storage.createWorkspaceData(result.data);
    res.status(201).json(data);
  });

  app.patch("/api/workspace/data/:id", async (req, res) => {
    const data = await storage.updateWorkspaceData(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.json(data);
  });

  app.delete("/api/workspace/data/:id", async (req, res) => {
    const deleted = await storage.deleteWorkspaceData(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}

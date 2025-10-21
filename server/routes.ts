import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProjectSchema,
  insertDepartmentSchema,
  insertTaskSchema,
  insertMemberSchema,
  insertMessageSchema,
  insertSettingsSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  progress: integer("progress").notNull().default(0),
  department: text("department").notNull(),
  teamMembers: text("team_members").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description"),
  teamMembers: text("team_members").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  assignedTo: text("assigned_to"),
  dueDate: text("due_date"),
  projectId: text("project_id"),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isVerified: text("is_verified").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  role: text("role"),
  department: text("department"),
  avatar: text("avatar"),
  phone: text("phone"),
  location: text("location"),
  skills: text("skills").array().default(sql`ARRAY[]::text[]`),
  isOnboardingComplete: text("is_onboarding_complete").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  avatar: text("avatar"),
  status: text("status").notNull().default("online"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name"),
  receiverId: text("receiver_id").notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceName: text("workspace_name").notNull().default("Clickers Workspace"),
  theme: text("theme").notNull().default("dark"),
});

export const workspaceNotes = pgTable("workspace_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: text("member_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const workspaceFiles = pgTable("workspace_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: text("member_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: text("uploaded_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const workspaceData = pgTable("workspace_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: text("member_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  dataType: text("data_type").notNull().default("string"),
  category: text("category").notNull().default("general"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertWorkspaceNoteSchema = createInsertSchema(workspaceNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkspaceFileSchema = createInsertSchema(workspaceFiles).omit({ id: true, uploadedAt: true });
export const insertWorkspaceDataSchema = createInsertSchema(workspaceData).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertWorkspaceNote = z.infer<typeof insertWorkspaceNoteSchema>;
export type WorkspaceNote = typeof workspaceNotes.$inferSelect;

export type InsertWorkspaceFile = z.infer<typeof insertWorkspaceFileSchema>;
export type WorkspaceFile = typeof workspaceFiles.$inferSelect;

export type InsertWorkspaceData = z.infer<typeof insertWorkspaceDataSchema>;
export type WorkspaceData = typeof workspaceData.$inferSelect;

// Authentication validation schemas
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileSetupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  role: z.string().min(2, "Role is required"),
  department: z.string().min(2, "Department is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).default([]),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type ProfileSetupData = z.infer<typeof profileSetupSchema>;

import { 
  type User, 
  type InsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type ButtonClick,
  type InsertButtonClick,
  contactSubmissions,
  buttonClicks,
  users,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(limit?: number): Promise<ContactSubmission[]>;
  getContactSubmissionById(id: string): Promise<ContactSubmission | undefined>;
  deleteContactSubmission(id: string): Promise<void>;
  markContactSubmissionAddressed(id: string): Promise<void>;
  editContactSubmission(
    id: string,
    data: { name: string; email: string; phone?: string; service: string; message: string }
  ): Promise<void>;

  // Button clicks tracking
  trackButtonClick(click: InsertButtonClick): Promise<ButtonClick>;
  getButtonClicks(limit?: number): Promise<ButtonClick[]>;
  getButtonClickStats(): Promise<{
    buttonType: string;
    buttonLabel: string;
    count: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Contact submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [result] = await db
      .insert(contactSubmissions)
      .values({ ...submission, id: randomUUID() })
      .returning();
    return result;
  }

  async getContactSubmissions(limit: number = 50): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(limit);
  }

  async getContactSubmissionById(id: string): Promise<ContactSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    return submission || undefined;
  }

  async deleteContactSubmission(id: string): Promise<void> {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  }

  async markContactSubmissionAddressed(id: string): Promise<void> {
    await db
      .update(contactSubmissions)
      .set({ addressed: true })
      .where(eq(contactSubmissions.id, id));
  }

  async editContactSubmission(
    id: string,
    { name, email, phone, service, message }: { name: string; email: string; phone?: string; service: string; message: string }
  ): Promise<void> {
    await db
      .update(contactSubmissions)
      .set({ name, email, phone, service, message })
      .where(eq(contactSubmissions.id, id));
  }

  // Button clicks tracking
  async trackButtonClick(click: InsertButtonClick): Promise<ButtonClick> {
    const [result] = await db
      .insert(buttonClicks)
      .values(click)
      .returning();
    return result;
  }

  async getButtonClicks(limit: number = 100): Promise<ButtonClick[]> {
    return await db
      .select()
      .from(buttonClicks)
      .orderBy(desc(buttonClicks.clickedAt))
      .limit(limit);
  }

  async getButtonClickStats(): Promise<{
    buttonType: string;
    buttonLabel: string;
    count: number;
  }[]> {
    const result = await db
      .select({
        buttonType: buttonClicks.buttonType,
        buttonLabel: buttonClicks.buttonLabel,
        count: sql<number>`count(*)::int`,
      })
      .from(buttonClicks)
      .groupBy(buttonClicks.buttonType, buttonClicks.buttonLabel)
      .orderBy(sql`count(*) desc`);
    
    return result;
  }
}

export const storage = new DatabaseStorage();
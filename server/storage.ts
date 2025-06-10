import { users, dashboardLayouts, type User, type InsertUser, type DashboardLayout, type InsertDashboardLayout } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDashboardLayout(userId: number): Promise<DashboardLayout | undefined>;
  saveDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dashboardLayouts: Map<number, DashboardLayout>;
  private currentUserId: number;
  private currentLayoutId: number;

  constructor() {
    this.users = new Map();
    this.dashboardLayouts = new Map();
    this.currentUserId = 1;
    this.currentLayoutId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDashboardLayout(userId: number): Promise<DashboardLayout | undefined> {
    return Array.from(this.dashboardLayouts.values()).find(
      (layout) => layout.userId === userId,
    );
  }

  async saveDashboardLayout(insertLayout: InsertDashboardLayout): Promise<DashboardLayout> {
    const existingLayout = await this.getDashboardLayout(insertLayout.userId);
    
    if (existingLayout) {
      const updatedLayout: DashboardLayout = {
        ...existingLayout,
        layout: insertLayout.layout,
      };
      this.dashboardLayouts.set(existingLayout.id, updatedLayout);
      return updatedLayout;
    }

    const id = this.currentLayoutId++;
    const layout: DashboardLayout = { ...insertLayout, id };
    this.dashboardLayouts.set(id, layout);
    return layout;
  }
}

export const storage = new MemStorage();

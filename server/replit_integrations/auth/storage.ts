import { users } from "@shared/schema";
import type { UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq, sql } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<typeof users.$inferSelect | undefined>;
  upsertUser(user: UpsertUser): Promise<typeof users.$inferSelect>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<typeof users.$inferSelect> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email || '',
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: userData.profileImageUrl,
        replitId: userData.id,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email || undefined,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImage: userData.profileImageUrl,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();

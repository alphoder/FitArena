import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db";
import { groups, groupMembers, users, zoneWeeklyScores } from "@fitarena/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { schemas } from "@fitarena/shared/validation";
import { generateInviteCode, getWeekStart } from "@fitarena/shared";

export async function groupRoutes(app: FastifyInstance): Promise<void> {
  // Create group
  app.post(
    "/api/v1/groups",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const body = schemas.group.create.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: body.error.flatten(),
          },
        });
      }

      const inviteCode = generateInviteCode();

      const [group] = await db
        .insert(groups)
        .values({
          ...body.data,
          ownerId: userId,
          inviteCode,
          memberCount: 1,
        })
        .returning();

      // Add creator as owner member
      await db.insert(groupMembers).values({
        groupId: group.id,
        userId,
        role: "owner",
      });

      return reply.status(201).send({
        success: true,
        data: group,
      });
    }
  );

  // Get group by ID
  app.get(
    "/api/v1/groups/:id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const group = await db.query.groups.findFirst({
        where: eq(groups.id, id),
        with: {
          zone: true,
          gym: true,
        },
      });

      if (!group) {
        return reply.status(404).send({
          success: false,
          error: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        });
      }

      // Get member count
      const memberCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId, id), eq(groupMembers.isActive, true)));

      return reply.send({
        success: true,
        data: {
          ...group,
          memberCount: memberCount[0]?.count || 0,
        },
      });
    }
  );

  // Update group
  app.patch(
    "/api/v1/groups/:id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const body = schemas.group.update.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: body.error.flatten(),
          },
        });
      }

      // Check if user is owner or admin
      const membership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, id), eq(groupMembers.userId, userId)),
      });

      if (!membership || !["owner", "admin"].includes(membership.role || "")) {
        return reply.status(403).send({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized to update this group" },
        });
      }

      const [updatedGroup] = await db
        .update(groups)
        .set({
          ...body.data,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, id))
        .returning();

      return reply.send({
        success: true,
        data: updatedGroup,
      });
    }
  );

  // Delete group
  app.delete(
    "/api/v1/groups/:id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const group = await db.query.groups.findFirst({
        where: eq(groups.id, id),
      });

      if (!group) {
        return reply.status(404).send({
          success: false,
          error: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        });
      }

      if (group.ownerId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: "FORBIDDEN", message: "Only the owner can delete this group" },
        });
      }

      // Soft delete - mark as inactive
      await db
        .update(groups)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(groups.id, id));

      return reply.send({
        success: true,
        data: { message: "Group deleted successfully" },
      });
    }
  );

  // Join group
  app.post(
    "/api/v1/groups/:id/join",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const body = schemas.group.join.safeParse(request.body);

      const group = await db.query.groups.findFirst({
        where: eq(groups.id, id),
      });

      if (!group || !group.isActive) {
        return reply.status(404).send({
          success: false,
          error: { code: "GROUP_NOT_FOUND", message: "Group not found" },
        });
      }

      // Check if already a member
      const existingMembership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, id), eq(groupMembers.userId, userId)),
      });

      if (existingMembership) {
        return reply.status(400).send({
          success: false,
          error: { code: "ALREADY_MEMBER", message: "Already a member of this group" },
        });
      }

      // Check invite code if group is invite-only
      if (group.type === "invite" && body.data?.inviteCode !== group.inviteCode) {
        return reply.status(403).send({
          success: false,
          error: { code: "INVALID_INVITE", message: "Invalid invite code" },
        });
      }

      // Check member limit
      const memberCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId, id), eq(groupMembers.isActive, true)));

      if ((memberCount[0]?.count || 0) >= (group.maxMembers || 50)) {
        return reply.status(400).send({
          success: false,
          error: { code: "GROUP_FULL", message: "Group has reached maximum members" },
        });
      }

      // Add member
      const [membership] = await db
        .insert(groupMembers)
        .values({
          groupId: id,
          userId,
          role: "member",
        })
        .returning();

      // Update member count
      await db
        .update(groups)
        .set({
          memberCount: sql`${groups.memberCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, id));

      return reply.status(201).send({
        success: true,
        data: membership,
      });
    }
  );

  // Leave group
  app.delete(
    "/api/v1/groups/:id/leave",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const membership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, id), eq(groupMembers.userId, userId)),
      });

      if (!membership) {
        return reply.status(404).send({
          success: false,
          error: { code: "NOT_MEMBER", message: "Not a member of this group" },
        });
      }

      if (membership.role === "owner") {
        return reply.status(400).send({
          success: false,
          error: { code: "OWNER_CANNOT_LEAVE", message: "Owner cannot leave. Transfer ownership or delete the group." },
        });
      }

      // Mark as inactive
      await db
        .update(groupMembers)
        .set({ isActive: false })
        .where(eq(groupMembers.id, membership.id));

      // Update member count
      await db
        .update(groups)
        .set({
          memberCount: sql`GREATEST(${groups.memberCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, id));

      return reply.send({
        success: true,
        data: { message: "Left group successfully" },
      });
    }
  );

  // Get group members
  app.get(
    "/api/v1/groups/:id/members",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const members = await db
        .select({
          id: groupMembers.id,
          userId: groupMembers.userId,
          role: groupMembers.role,
          joinedAt: groupMembers.joinedAt,
          weeklyAp: groupMembers.weeklyAp,
          displayName: users.displayName,
          profilePhotoUrl: users.profilePhotoUrl,
          level: users.level,
          currentStreak: users.currentStreak,
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(and(eq(groupMembers.groupId, id), eq(groupMembers.isActive, true)))
        .orderBy(desc(groupMembers.weeklyAp));

      return reply.send({
        success: true,
        data: members,
      });
    }
  );

  // Update member role
  app.patch(
    "/api/v1/groups/:id/members/:userId/role",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUserId = request.user!.userId;
      const { id, userId: targetUserId } = request.params as { id: string; userId: string };
      const body = schemas.group.updateMemberRole.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
          },
        });
      }

      // Check if current user is owner
      const currentMembership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, id), eq(groupMembers.userId, currentUserId)),
      });

      if (!currentMembership || currentMembership.role !== "owner") {
        return reply.status(403).send({
          success: false,
          error: { code: "FORBIDDEN", message: "Only the owner can change roles" },
        });
      }

      // Update target member's role
      const [updated] = await db
        .update(groupMembers)
        .set({ role: body.data.role })
        .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, targetUserId)))
        .returning();

      return reply.send({
        success: true,
        data: updated,
      });
    }
  );

  // Get group leaderboard
  app.get(
    "/api/v1/groups/:id/leaderboard",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const { period = "week" } = request.query as { period?: string };

      const members = await db
        .select({
          userId: groupMembers.userId,
          weeklyAp: groupMembers.weeklyAp,
          displayName: users.displayName,
          profilePhotoUrl: users.profilePhotoUrl,
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(and(eq(groupMembers.groupId, id), eq(groupMembers.isActive, true)))
        .orderBy(desc(groupMembers.weeklyAp))
        .limit(20);

      const leaderboard = members.map((m, index) => ({
        rank: index + 1,
        userId: m.userId,
        displayName: m.displayName,
        profilePhotoUrl: m.profilePhotoUrl,
        score: m.weeklyAp || 0,
      }));

      return reply.send({
        success: true,
        data: leaderboard,
      });
    }
  );
}

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { lists, listItems, claims, contributions, listAccess } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const viewerRouter = createRouter({
  // Get a list by ID for public viewing (requires correct password in input)
  getList: publicQuery
    .input(z.object({ id: z.number(), password: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const list = await db.query.lists.findFirst({
        where: and(eq(lists.id, input.id), eq(lists.password, input.password)),
        with: {
          owner: true,
          items: { with: { claims: true, contributions: true } },
          coOwners: { with: { user: true } },
        },
      });
      if (!list) throw new Error("Invalid list or password");
      return list;
    }),

  // Verify password only (for the access gate page)
  verifyPassword: publicQuery
    .input(z.object({ id: z.number(), password: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const list = await db.query.lists.findFirst({
        where: and(eq(lists.id, input.id), eq(lists.password, input.password)),
      });
      if (!list) throw new Error("Invalid password");
      return { valid: true, listId: list.id, title: list.title };
    }),

  verifyPasswordMutation: publicQuery
    .input(z.object({ id: z.number(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const list = await db.query.lists.findFirst({
        where: and(eq(lists.id, input.id), eq(lists.password, input.password)),
      });
      if (!list) throw new Error("Invalid password");
      return { valid: true, listId: list.id, title: list.title };
    }),

  // Claim an item (no auth required)
  claim: publicQuery
    .input(
      z.object({
        itemId: z.number(),
        name: z.string().min(1).max(255),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const item = await db.query.listItems.findFirst({
        where: eq(listItems.id, input.itemId),
        with: { list: true, claims: true },
      });
      if (!item) throw new Error("Item not found");
      // Check if already claimed (by quantity)
      const claimedCount = item.claims.length;
      if (claimedCount >= item.quantity) throw new Error("Item already fully claimed");

      const result = await db.insert(claims).values({
        itemId: input.itemId,
        name: input.name,
        email: input.email,
      }).returning({ id: claims.id });
      const insertedId = result[0].id;

      // Track access
      const existingAccess = await db.query.listAccess.findFirst({
        where: and(eq(listAccess.listId, item.listId), eq(listAccess.email, input.email)),
      });
      if (!existingAccess) {
        await db.insert(listAccess).values({
          listId: item.listId,
          email: input.email,
          name: input.name,
        });
      }

      return db.query.claims.findFirst({ where: eq(claims.id, insertedId) });
    }),

  // Unclaim an item by claim ID
  unclaim: publicQuery
    .input(z.object({ claimId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const claim = await db.query.claims.findFirst({
        where: eq(claims.id, input.claimId),
      });
      if (!claim) throw new Error("Claim not found");
      await db.delete(claims).where(eq(claims.id, input.claimId));
      return { success: true };
    }),

  // Mark item as purchased
  markPurchased: publicQuery
    .input(z.object({ claimId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const claim = await db.query.claims.findFirst({
        where: eq(claims.id, input.claimId),
      });
      if (!claim) throw new Error("Claim not found");
      await db.update(claims).set({ purchased: true }).where(eq(claims.id, input.claimId));
      return { success: true };
    }),

  // Contribute to a group gift
  contribute: publicQuery
    .input(
      z.object({
        itemId: z.number(),
        name: z.string().min(1).max(255),
        email: z.string().email(),
        amount: z.number().positive(),
        paid: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const item = await db.query.listItems.findFirst({
        where: eq(listItems.id, input.itemId),
        with: { list: true },
      });
      if (!item) throw new Error("Item not found");

      const result = await db.insert(contributions).values({
        itemId: input.itemId,
        name: input.name,
        email: input.email,
        amount: String(input.amount),
        paid: input.paid,
      }).returning({ id: contributions.id });
      const insertedId = result[0].id;

      // Track access
      const existingAccess = await db.query.listAccess.findFirst({
        where: and(eq(listAccess.listId, item.listId), eq(listAccess.email, input.email)),
      });
      if (!existingAccess) {
        await db.insert(listAccess).values({
          listId: item.listId,
          email: input.email,
          name: input.name,
        });
      }

      return db.query.contributions.findFirst({ where: eq(contributions.id, insertedId) });
    }),

  // Update a contribution
  updateContribution: publicQuery
    .input(
      z.object({
        contributionId: z.number(),
        amount: z.number().positive(),
        paid: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const contrib = await db.query.contributions.findFirst({
        where: eq(contributions.id, input.contributionId),
      });
      if (!contrib) throw new Error("Contribution not found");
      await db
        .update(contributions)
        .set({ amount: String(input.amount), paid: input.paid })
        .where(eq(contributions.id, input.contributionId));
      return { success: true };
    }),

  // Delete a contribution
  deleteContribution: publicQuery
    .input(z.object({ contributionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const contrib = await db.query.contributions.findFirst({
        where: eq(contributions.id, input.contributionId),
      });
      if (!contrib) throw new Error("Contribution not found");
      await db.delete(contributions).where(eq(contributions.id, input.contributionId));
      return { success: true };
    }),
});

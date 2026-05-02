import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  // Get current user settings
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, ctx.user.id),
    });
    if (!settings) {
      const result = await db.insert(userSettings).values({
        userId: ctx.user.id,
      }).returning({ id: userSettings.id });
      return db.query.userSettings.findFirst({
        where: eq(userSettings.id, result[0].id),
      });
    }
    return settings;
  }),

  // Update settings
  update: authedQuery
    .input(
      z.object({
        notifyClaim: z.boolean().optional(),
        notifyContribution: z.boolean().optional(),
        notifyNewItem: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, ctx.user.id),
      });

      const updateData: Record<string, unknown> = {};
      if (input.notifyClaim !== undefined) updateData.notifyClaim = input.notifyClaim;
      if (input.notifyContribution !== undefined) updateData.notifyContribution = input.notifyContribution;
      if (input.notifyNewItem !== undefined) updateData.notifyNewItem = input.notifyNewItem;

      if (existing) {
        await db.update(userSettings).set(updateData).where(eq(userSettings.id, existing.id));
        return db.query.userSettings.findFirst({ where: eq(userSettings.id, existing.id) });
      } else {
        const result = await db.insert(userSettings).values({
          userId: ctx.user.id,
          ...updateData,
        }).returning({ id: userSettings.id });
        return db.query.userSettings.findFirst({
          where: eq(userSettings.id, result[0].id),
        });
      }
    }),
});

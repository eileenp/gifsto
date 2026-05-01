import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  // Create a demo list
  const listResult = await db.insert(schema.lists).values({
    title: "Sarah's Birthday Wishlist",
    password: "sarah-bday-2025",
    ownerId: 1,
    zelle: "sarah@example.com",
    venmo: "@sarah-venmo",
  }).returning({ id: schema.lists.id });
  const listId = listResult[0].id;

  const items = [
    { name: "Le Creuset Dutch Oven", price: "350.00", quantity: 1, notes: "In Sage Green or Terracotta color", purchaseUrl: "https://www.lecreuset.com", imageUrl: null, isGroupGift: false },
    { name: "Cashmere Throw Blanket", price: "120.00", quantity: 1, notes: "Soft, cozy, warm beige", purchaseUrl: "https://example.com/blanket", imageUrl: null, isGroupGift: false },
    { name: "Birthday Dinner Fund", price: null, quantity: 1, notes: "Group gift for a fancy dinner out", purchaseUrl: null, imageUrl: null, isGroupGift: true, targetPrice: "500.00" },
    { name: "Botanical Art Print Set", price: "45.00", quantity: 2, notes: "Set of 3 prints, 8x10", purchaseUrl: "https://example.com/prints", imageUrl: null, isGroupGift: false },
  ];

  for (const item of items) {
    await db.insert(schema.listItems).values({ listId, ...item });
  }

  const itemRows = await db.query.listItems.findMany({ where: eq(schema.listItems.listId, listId) });

  await db.insert(schema.claims).values({
    itemId: itemRows[0].id,
    name: "Emily Johnson",
    email: "emily@example.com",
    purchased: false,
  });

  const groupItem = itemRows.find((i: any) => i.isGroupGift);
  if (groupItem) {
    await db.insert(schema.contributions).values({ itemId: groupItem.id, name: "Mike Chen", email: "mike@example.com", amount: "75.00", paid: true });
    await db.insert(schema.contributions).values({ itemId: groupItem.id, name: "Jessica Lee", email: "jessica@example.com", amount: "50.00", paid: false });
  }

  await db.insert(schema.listAccess).values({ listId, email: "emily@example.com", name: "Emily Johnson" });
  await db.insert(schema.listAccess).values({ listId, email: "mike@example.com", name: "Mike Chen" });
  await db.insert(schema.listAccess).values({ listId, email: "jessica@example.com", name: "Jessica Lee" });

  console.log("Seeded list:", listId);
}

seed().catch(console.error);

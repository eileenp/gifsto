import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  int,
  decimal,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const lists = mysqlTable("lists", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  ownerId: bigint("ownerId", { mode: "number", unsigned: true }).notNull(),
  zelle: varchar("zelle", { length: 255 }),
  venmo: varchar("venmo", { length: 255 }),
  paypal: varchar("paypal", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const listItems = mysqlTable("list_items", {
  id: serial("id").primaryKey(),
  listId: bigint("listId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  quantity: int("quantity").notNull().default(1),
  notes: text("notes"),
  purchaseUrl: text("purchaseUrl"),
  imageUrl: text("imageUrl"),
  isGroupGift: boolean("isGroupGift").notNull().default(false),
  targetPrice: decimal("targetPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const claims = mysqlTable("claims", {
  id: serial("id").primaryKey(),
  itemId: bigint("itemId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  purchased: boolean("purchased").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contributions = mysqlTable("contributions", {
  id: serial("id").primaryKey(),
  itemId: bigint("itemId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paid: boolean("paid").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const listAccess = mysqlTable("list_access", {
  id: serial("id").primaryKey(),
  listId: bigint("listId", { mode: "number", unsigned: true }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  saved: boolean("saved").notNull().default(false),
  removedAt: timestamp("removedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const coOwners = mysqlTable("co_owners", {
  id: serial("id").primaryKey(),
  listId: bigint("listId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userSettings = mysqlTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  notifyClaim: boolean("notifyClaim").notNull().default(true),
  notifyContribution: boolean("notifyContribution").notNull().default(true),
  notifyNewItem: boolean("notifyNewItem").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type List = typeof lists.$inferSelect;
export type ListItem = typeof listItems.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type ListAccess = typeof listAccess.$inferSelect;
export type CoOwner = typeof coOwners.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;

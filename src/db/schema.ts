import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  integer,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";

export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  previewUrl: text("preview_url"),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  category: varchar("category", { length: 80 }).notNull().default("General"),
  isPublished: boolean("is_published").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  telegramFileId: text("telegram_file_id"),
  telegramMessageId: integer("telegram_message_id"),
  telegramThumbFileId: text("telegram_thumb_file_id"),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  qrString: text("qr_string"),
  md5: varchar("md5", { length: 64 }),
  billNumber: varchar("bill_number", { length: 64 }).notNull(),
  accessToken: varchar("access_token", { length: 64 }).notNull(),
  customerName: varchar("customer_name", { length: 120 }),
  customerPhone: varchar("customer_phone", { length: 40 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Video = typeof videos.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type NewOrder = typeof orders.$inferInsert;

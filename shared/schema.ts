import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the Event table schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  creator: text("creator").notNull(), // Wallet address of creator
  tokenMintAddress: text("token_mint_address").notNull(), // Solana compressed token address
  qrCodeData: text("qr_code_data").notNull(), // Data for QR code
  maxAttendees: integer("max_attendees"), // Optional limit
  imageUrl: text("image_url"), // Optional image URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the TokenClaim table schema for tracking claimed tokens
export const tokenClaims = pgTable("token_claims", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  walletAddress: text("wallet_address").notNull(), // Attendee wallet address
  transactionSignature: text("transaction_signature").notNull(), // Solana transaction signature
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

// Create insert schemas for validation
export const insertEventSchema = createInsertSchema(events)
  .omit({ id: true, createdAt: true })
  .extend({
    // Handle date properly for JSON serialization
    date: z.string().transform((dateString) => new Date(dateString))
  });

export const insertTokenClaimSchema = createInsertSchema(tokenClaims)
  .omit({ id: true, claimedAt: true });

// Export types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type TokenClaim = typeof tokenClaims.$inferSelect;
export type InsertTokenClaim = z.infer<typeof insertTokenClaimSchema>;

import { pgTable, text, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  userType: text("user_type").notNull().$type<'rider' | 'driver'>(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rides = pgTable("rides", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  departureDate: text("departure_date"),
  departureTime: text("departure_time").notNull(),
  availableSeats: text("available_seats").notNull(),
  price: text("price").notNull(),
  vehicleInfo: text("vehicle_info"),
  notes: text("notes"),
  isRecurring: text("is_recurring").notNull().$type<'true' | 'false'>(),
  recurringData: text("recurring_data"), // JSON string
  status: text("status").notNull().default('active').$type<'active' | 'cancelled' | 'completed'>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rideRequests = pgTable("ride_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  riderId: uuid("rider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  departureDate: text("departure_date"),
  departureTime: text("departure_time").notNull(),
  passengers: text("passengers").notNull(),
  maxPrice: text("max_price"),
  notes: text("notes"),
  status: text("status").notNull().default('active').$type<'active' | 'matched' | 'cancelled'>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  userType: true,
});

export const insertSessionSchema = createInsertSchema(sessions);
export const insertRideSchema = createInsertSchema(rides);
export const insertRideRequestSchema = createInsertSchema(rideRequests);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Ride = typeof rides.$inferSelect;
export type RideRequest = typeof rideRequests.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type InsertRideRequest = z.infer<typeof insertRideRequestSchema>;

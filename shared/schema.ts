import { pgTable, text, serial, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
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
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  county: text("county"),
  postcode: text("postcode"),
  country: text("country"),
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

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  rideId: uuid("ride_id").notNull().references(() => rides.id, { onDelete: "cascade" }),
  riderId: uuid("rider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  driverId: uuid("driver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  seatsBooked: integer("seats_booked").notNull(),
  phoneNumber: text("phone_number").notNull(),
  message: text("message"),
  totalCost: text("total_cost").notNull(),
  status: text("status").notNull().default('pending').$type<'pending' | 'confirmed' | 'cancelled' | 'completed'>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'message', 'booking_request', 'booking_confirmed', 'ride_completed'
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: uuid("related_id"), // bookingId, messageId, etc.
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  userType: true,
  avatarUrl: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  county: true,
  postcode: true,
  country: true,
});

export const insertSessionSchema = createInsertSchema(sessions);
export const insertRideSchema = createInsertSchema(rides);
export const insertRideRequestSchema = createInsertSchema(rideRequests);
export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  jobId: true  // Job ID will be auto-generated
});
export const insertMessageSchema = createInsertSchema(messages);
export const insertNotificationSchema = createInsertSchema(notifications);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Ride = typeof rides.$inferSelect;
export type RideRequest = typeof rideRequests.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type InsertRideRequest = z.infer<typeof insertRideRequestSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

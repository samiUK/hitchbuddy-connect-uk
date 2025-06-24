import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth (mandatory)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth (mandatory)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: text("phone"),
  userType: text("user_type").notNull().default('rider').$type<'rider' | 'driver'>(),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  county: text("county"),
  postcode: text("postcode"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rides = pgTable("rides", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: varchar("driver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  riderId: varchar("rider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  departureDate: text("departure_date"),
  departureTime: text("departure_time").notNull(),
  passengers: text("passengers").notNull(),
  maxPrice: text("max_price"),
  notes: text("notes"),
  status: text("status").notNull().default('pending').$type<'pending' | 'matched' | 'cancelled'>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: text("job_id").notNull().unique(),
  rideId: uuid("ride_id").references(() => rides.id, { onDelete: "cascade" }),
  riderId: varchar("rider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  driverId: varchar("driver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'message', 'booking_request', 'booking_confirmed', 'ride_completed', 'rating_request'
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: uuid("related_id"), // bookingId, messageId, etc.
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  raterId: varchar("rater_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ratedUserId: varchar("rated_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  phone: true,
  userType: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  county: true,
  postcode: true,
  country: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
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
export const insertRatingSchema = createInsertSchema(ratings);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
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
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

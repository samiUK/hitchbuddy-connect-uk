const { pgTable, text, timestamp, uuid, integer, boolean } = require('drizzle-orm/pg-core');
const { createInsertSchema } = require('drizzle-zod');

const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  userType: text("user_type").notNull(),
  avatarUrl: text("avatar_url"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  county: text("county"),
  postcode: text("postcode"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

const rides = pgTable("rides", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id").notNull().references(() => users.id),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  departureDate: text("departure_date").notNull(),
  departureTime: text("departure_time").notNull(),
  availableSeats: integer("available_seats").notNull(),
  price: integer("price").notNull(),
  vehicleInfo: text("vehicle_info"),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringData: text("recurring_data"),
  status: text("status").default('active'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

const rideRequests = pgTable("ride_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  riderId: uuid("rider_id").notNull().references(() => users.id),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  departureDate: text("departure_date").notNull(),
  departureTime: text("departure_time").notNull(),
  passengers: integer("passengers").notNull(),
  maxPrice: integer("max_price"),
  notes: text("notes"),
  status: text("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: text("job_id").notNull(),
  rideId: uuid("ride_id").references(() => rides.id),
  riderId: uuid("rider_id").notNull().references(() => users.id),
  driverId: uuid("driver_id").notNull().references(() => users.id),
  seatsBooked: integer("seats_booked").notNull(),
  phoneNumber: text("phone_number"),
  message: text("message"),
  totalCost: integer("total_cost").notNull(),
  status: text("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: uuid("related_id"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  raterId: uuid("rater_id").notNull().references(() => users.id),
  ratedUserId: uuid("rated_user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

module.exports = {
  users,
  sessions,
  rides,
  rideRequests,
  bookings,
  messages,
  notifications,
  ratings
};
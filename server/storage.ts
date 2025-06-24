import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, sessions, rides, rideRequests, bookings, messages, type User, type InsertUser, type Session, type Ride, type RideRequest, type Booking, type Message, type InsertRide, type InsertRideRequest, type InsertBooking, type InsertMessage } from "@shared/schema";
import { eq, or } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  createSession(userId: string): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  // Rides
  createRide(ride: InsertRide): Promise<Ride>;
  getRides(): Promise<Ride[]>;
  getRidesByDriver(driverId: string): Promise<Ride[]>;
  updateRide(id: string, updates: Partial<Ride>): Promise<Ride | undefined>;
  deleteRide(id: string): Promise<void>;
  // Ride Requests
  createRideRequest(request: InsertRideRequest): Promise<RideRequest>;
  getRideRequests(): Promise<RideRequest[]>;
  getRideRequestsByRider(riderId: string): Promise<RideRequest[]>;
  updateRideRequest(id: string, updates: Partial<RideRequest>): Promise<RideRequest | undefined>;
  deleteRideRequest(id: string): Promise<void>;
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
  getRide(id: string): Promise<Ride | undefined>;
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByBooking(bookingId: string): Promise<Message[]>;
}

export class PostgreSQLStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const result = await db.insert(users).values({
      email: insertUser.email,
      password: hashedPassword,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      phone: insertUser.phone,
      userType: insertUser.userType as 'rider' | 'driver'
    }).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async createSession(userId: string): Promise<Session> {
    const sessionId = nanoid();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const result = await db.insert(sessions).values({
      id: sessionId,
      userId,
      expiresAt
    }).returning();
    
    return result[0];
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
    const session = result[0];
    
    if (session && session.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return undefined;
    }
    
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Rides methods
  async createRide(insertRide: InsertRide): Promise<Ride> {
    const result = await db.insert(rides).values([insertRide]).returning();
    return result[0];
  }

  async getRides(): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.status, 'active'));
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.driverId, driverId));
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride | undefined> {
    const result = await db.update(rides)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rides.id, id))
      .returning();
    return result[0];
  }

  async deleteRide(id: string): Promise<void> {
    await db.delete(rides).where(eq(rides.id, id));
  }

  // Ride Requests methods
  async createRideRequest(insertRequest: InsertRideRequest): Promise<RideRequest> {
    const result = await db.insert(rideRequests).values([insertRequest]).returning();
    return result[0];
  }

  async getRideRequests(): Promise<RideRequest[]> {
    return await db.select().from(rideRequests).where(eq(rideRequests.status, 'active'));
  }

  async getRideRequestsByRider(riderId: string): Promise<RideRequest[]> {
    return await db.select().from(rideRequests).where(eq(rideRequests.riderId, riderId));
  }

  async updateRideRequest(id: string, updates: Partial<RideRequest>): Promise<RideRequest | undefined> {
    const result = await db.update(rideRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rideRequests.id, id))
      .returning();
    return result[0];
  }

  async deleteRideRequest(id: string): Promise<void> {
    await db.delete(rideRequests).where(eq(rideRequests.id, id));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values([insertBooking])
      .returning();
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(or(eq(bookings.riderId, userId), eq(bookings.driverId, userId)));
    return userBookings;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async getRide(id: string): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride || undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesByBooking(bookingId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(messages.createdAt);
  }
}

export const storage = new PostgreSQLStorage();

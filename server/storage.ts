import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, sessions, rides, rideRequests, bookings, messages, notifications, type User, type InsertUser, type Session, type Ride, type RideRequest, type Booking, type Message, type Notification, type InsertRide, type InsertRideRequest, type InsertBooking, type InsertMessage, type InsertNotification } from "@shared/schema";
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
  getBooking(id: string): Promise<Booking | undefined>;
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByBooking(bookingId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
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
    console.log('Storage: Updating user', id, 'with updates:', updates);
    
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    // Only include fields that are defined in the updates
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.addressLine1 !== undefined) updateData.addressLine1 = updates.addressLine1;
    if (updates.addressLine2 !== undefined) updateData.addressLine2 = updates.addressLine2;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.county !== undefined) updateData.county = updates.county;
    if (updates.postcode !== undefined) updateData.postcode = updates.postcode;
    if (updates.country !== undefined) updateData.country = updates.country;
    if (updates.userType !== undefined) updateData.userType = updates.userType;
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;
    
    console.log('Storage: Final update data:', updateData);
    
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
      
    console.log('Storage: Updated user result:', result[0]);
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
    const rideData = {
      ...insertRide,
      isRecurring: insertRide.isRecurring === 'true' ? 'true' : 'false'
    };
    const result = await db.insert(rides).values([rideData]).returning();
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
    const requestData = {
      ...insertRequest,
      status: (insertRequest.status || 'active') as 'active' | 'cancelled' | 'matched'
    };
    const result = await db.insert(rideRequests).values([requestData]).returning();
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

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
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

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(messages.id, messageId));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    // Get bookings where user is involved and count unread messages not sent by them
    const userBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.riderId, userId))
      .union(
        db.select({ id: bookings.id })
          .from(bookings)
          .where(eq(bookings.driverId, userId))
      );
    
    const bookingIds = userBookings.map(b => b.id);
    if (bookingIds.length === 0) return 0;

    const unreadMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.isRead, false),
          // Message not sent by current user
          // Note: We'll need to check this in the application logic
        )
      );

    // Filter messages not sent by current user
    return unreadMessages.filter(msg => msg.senderId !== userId).length;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    return result.length;
  }
}

export const storage = new PostgreSQLStorage();

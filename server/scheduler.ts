import { storage } from './storage';
import { rides, rideRequests, bookings } from '../shared/schema';
import { db } from './db';
import { eq, and, or } from 'drizzle-orm';

export class RideScheduler {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    // Check every minute for expired rides/requests
    this.intervalId = setInterval(() => {
      this.checkExpiredItems();
    }, 60000); // 60 seconds

    console.log('[scheduler] Started ride cancellation scheduler');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[scheduler] Stopped ride cancellation scheduler');
    }
  }

  private async checkExpiredItems() {
    try {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

      await this.cancelExpiredRides(cutoffTime);
      await this.cancelExpiredRideRequests(cutoffTime);
      await this.cancelExpiredBookings(cutoffTime);
    } catch (error) {
      console.error('[scheduler] Error checking expired items:', error);
    }
  }

  private async cancelExpiredRides(cutoffTime: Date) {
    try {
      // Get all active rides that are within 15 minutes of departure and have no bookings
      const activeRides = await db
        .select()
        .from(rides)
        .where(eq(rides.status, 'active'));

      for (const ride of activeRides) {
        // Skip recurring rides - they should remain active for future bookings
        if (ride.isRecurring === 'true') {
          continue;
        }

        if (this.isExpired(ride.departureDate, ride.departureTime, cutoffTime)) {
          // Check if ride has any confirmed bookings
          const confirmedBookings = await db
            .select()
            .from(bookings)
            .where(and(
              eq(bookings.rideId, ride.id),
              eq(bookings.status, 'confirmed')
            ));

          if (confirmedBookings.length === 0) {
            // Cancel the ride - no confirmed bookings (only for non-recurring rides)
            await db
              .update(rides)
              .set({ 
                status: 'cancelled',
                updatedAt: new Date()
              })
              .where(eq(rides.id, ride.id));

            // Cancel any pending bookings for this ride
            await db
              .update(bookings)
              .set({ 
                status: 'cancelled',
                updatedAt: new Date()
              })
              .where(and(
                eq(bookings.rideId, ride.id),
                eq(bookings.status, 'pending')
              ));

            console.log(`[scheduler] Cancelled expired ride: ${ride.fromLocation} → ${ride.toLocation} at ${ride.departureTime}`);

            // Create notification for driver
            await storage.createNotification({
              userId: ride.driverId,
              type: 'ride_cancelled',
              title: 'Ride Automatically Cancelled',
              message: `Your ride from ${ride.fromLocation} to ${ride.toLocation} was cancelled due to no bookings 15 minutes before departure.`,
              relatedId: ride.id
            });
          }
        }
      }
    } catch (error) {
      console.error('[scheduler] Error cancelling expired rides:', error);
    }
  }

  private async cancelExpiredRideRequests(cutoffTime: Date) {
    try {
      // Get all active ride requests that are within 15 minutes of departure
      const activeRequests = await db
        .select()
        .from(rideRequests)
        .where(eq(rideRequests.status, 'active'));

      for (const request of activeRequests) {
        if (this.isExpired(request.departureDate, request.departureTime, cutoffTime)) {
          // Cancel the ride request
          await db
            .update(rideRequests)
            .set({ 
              status: 'cancelled',
              updatedAt: new Date()
            })
            .where(eq(rideRequests.id, request.id));

          console.log(`[scheduler] Cancelled expired ride request: ${request.fromLocation} → ${request.toLocation} at ${request.departureTime}`);

          // Create notification for rider
          await storage.createNotification({
            userId: request.riderId,
            type: 'request_cancelled',
            title: 'Ride Request Automatically Cancelled',
            message: `Your ride request from ${request.fromLocation} to ${request.toLocation} was cancelled due to no driver match 15 minutes before departure.`,
            relatedId: request.id
          });
        }
      }
    } catch (error) {
      console.error('[scheduler] Error cancelling expired ride requests:', error);
    }
  }

  private async cancelExpiredBookings(cutoffTime: Date) {
    try {
      // Get all pending bookings that are within 15 minutes of departure
      const pendingBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.status, 'pending'));

      for (const booking of pendingBookings) {
        let departureDate: string | null = null;
        let departureTime: string | null = null;

        // Get departure info from ride or ride request
        if (booking.rideId) {
          const ride = await db
            .select()
            .from(rides)
            .where(eq(rides.id, booking.rideId))
            .limit(1);
          
          if (ride.length > 0) {
            departureDate = booking.selectedDate || ride[0].departureDate;
            departureTime = ride[0].departureTime;
          }
        }

        if (departureDate && departureTime && this.isExpired(departureDate, departureTime, cutoffTime)) {
          // Cancel the pending booking
          await db
            .update(bookings)
            .set({ 
              status: 'cancelled',
              updatedAt: new Date()
            })
            .where(eq(bookings.id, booking.id));

          console.log(`[scheduler] Cancelled expired pending booking: ${booking.id}`);

          // Create notifications for both rider and driver
          await storage.createNotification({
            userId: booking.riderId,
            type: 'booking_cancelled',
            title: 'Booking Automatically Cancelled',
            message: `Your booking was cancelled due to no driver approval 15 minutes before departure.`,
            relatedId: booking.id
          });

          await storage.createNotification({
            userId: booking.driverId,
            type: 'booking_cancelled',
            title: 'Booking Request Expired',
            message: `A booking request was automatically cancelled 15 minutes before departure.`,
            relatedId: booking.id
          });
        }
      }
    } catch (error) {
      console.error('[scheduler] Error cancelling expired bookings:', error);
    }
  }

  private isExpired(departureDate: string | null, departureTime: string, cutoffTime: Date): boolean {
    try {
      if (!departureDate) {
        // If no date, assume today
        departureDate = new Date().toISOString().split('T')[0];
      }

      // Parse the departure date and time
      const [hours, minutes] = departureTime.split(':').map(Number);
      const departureDateTime = new Date(departureDate);
      departureDateTime.setHours(hours, minutes, 0, 0);

      // Check if departure time is within 15 minutes from now
      return departureDateTime <= cutoffTime;
    } catch (error) {
      console.error('[scheduler] Error parsing date/time:', error);
      return false;
    }
  }
}

export const rideScheduler = new RideScheduler();
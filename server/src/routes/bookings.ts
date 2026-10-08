import { Router, Request, Response } from 'express';
import { db } from '../services/supabase.js';
import { BookingStatus } from '../types.js';

const router = Router();

// GET bookings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { residentId, providerId } = req.query;
    const bookings = await db.getBookings({
      residentId: residentId as string,
      providerId: providerId as string
    });
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch bookings', message: error.message });
  }
});

// POST create booking
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      residentId,
      residentName,
      residentPhone,
      providerId,
      providerName,
      categoryId,
      serviceName,
      problemDescription,
      photoUrl,
      address,
      latitude,
      longitude,
      preferredDate,
      preferredTime,
      isEmergency,
      estimatedPrice
    } = req.body;

    if (!residentId || !providerId || !serviceName || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const booking = await db.createBooking({
      residentId,
      residentName: residentName || 'Resident',
      residentPhone: residentPhone || '+1 (555) 000-0000',
      providerId,
      providerName: providerName || 'Service Provider',
      categoryId: categoryId || 'plumbing',
      serviceName,
      problemDescription: problemDescription || 'Service requested',
      photoUrl,
      address: address || 'Current Location',
      latitude: Number(latitude) || 12.9716,
      longitude: Number(longitude) || 77.5946,
      preferredDate,
      preferredTime,
      isEmergency: !!isEmergency,
      estimatedPrice: Number(estimatedPrice) || 35
    });

    return res.status(201).json({ success: true, booking });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Failed to create booking', message: error.message });
  }
});

// PATCH update booking status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses: BookingStatus[] = [
      'requested',
      'accepted',
      'on_the_way',
      'in_progress',
      'completed',
      'cancelled'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await db.updateBookingStatus(id, status as BookingStatus, notes);
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.json({ success: true, booking: updated });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update booking status', message: error.message });
  }
});

export default router;

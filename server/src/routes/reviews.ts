import { Router, Request, Response } from 'express';
import { db } from '../services/supabase.js';

const router = Router();

router.get('/:providerId', async (req: Request, res: Response) => {
  try {
    const reviews = await db.getReviews(req.params.providerId);
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { bookingId, residentId, residentName, providerId, rating, comment } = req.body;

    if (!bookingId || !residentId || !providerId || !rating) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const review = await db.createReview({
      bookingId,
      residentId,
      residentName: residentName || 'Resident',
      providerId,
      rating: Number(rating),
      comment: comment || ''
    });

    return res.status(201).json({ success: true, review });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create review', message: error.message });
  }
});

export default router;

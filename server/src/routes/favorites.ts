import { Router, Request, Response } from 'express';
import { db } from '../services/supabase.js';

const router = Router();

router.get('/:residentId', async (req: Request, res: Response) => {
  try {
    const favorites = await db.getFavorites(req.params.residentId);
    return res.json({ success: true, favorites });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch favorites', message: error.message });
  }
});

router.post('/toggle', async (req: Request, res: Response) => {
  try {
    const { residentId, providerId } = req.body;
    if (!residentId || !providerId) {
      return res.status(400).json({ error: 'residentId and providerId are required' });
    }

    const result = await db.toggleFavorite(residentId, providerId);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to toggle favorite', message: error.message });
  }
});

export default router;

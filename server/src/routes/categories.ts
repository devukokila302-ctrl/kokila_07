import { Router, Request, Response } from 'express';
import { db } from '../services/supabase.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    return res.json({ success: true, categories });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch categories', message: error.message });
  }
});

export default router;

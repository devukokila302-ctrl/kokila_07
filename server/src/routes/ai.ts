import { Router, Request, Response } from 'express';
import { analyzeServiceRequest, analyzeServiceImage, scoreProvider } from '../services/gemini.js';
import { db } from '../services/supabase.js';

const router = Router();

// Text request analysis
router.post('/analyze-request', async (req: Request, res: Response) => {
  try {
    const { text, residentLat, residentLng } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text description is required' });
    }

    const analysis = await analyzeServiceRequest(text);

    // Also fetch and rank matching providers for this resident
    const providers = await db.getProviders({ categoryId: analysis.recommendedCategoryId });
    const userLat = typeof residentLat === 'number' ? residentLat : 12.9716;
    const userLng = typeof residentLng === 'number' ? residentLng : 77.5946;

    const rankedProviders = providers.map(p => {
      const match = scoreProvider(
        p,
        analysis.recommendedCategoryId,
        analysis.urgency === 'emergency',
        userLat,
        userLng
      );
      return {
        ...p,
        matchPercentage: match.matchPercentage,
        distanceKm: match.distanceKm,
        matchFactors: match.factors
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({
      success: true,
      analysis,
      suggestedProviders: rankedProviders.slice(0, 5)
    });
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return res.status(500).json({ error: 'AI analysis failed', message: error.message });
  }
});

// Image request analysis
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, notes, residentLat, residentLng } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const analysis = await analyzeServiceImage(cleanBase64, mimeType || 'image/jpeg', notes);

    // Fetch matching providers
    const providers = await db.getProviders({ categoryId: analysis.recommendedCategoryId });
    const userLat = typeof residentLat === 'number' ? residentLat : 12.9716;
    const userLng = typeof residentLng === 'number' ? residentLng : 77.5946;

    const rankedProviders = providers.map(p => {
      const match = scoreProvider(
        p,
        analysis.recommendedCategoryId,
        analysis.urgency === 'emergency',
        userLat,
        userLng
      );
      return {
        ...p,
        matchPercentage: match.matchPercentage,
        distanceKm: match.distanceKm
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({
      success: true,
      analysis,
      suggestedProviders: rankedProviders.slice(0, 5)
    });
  } catch (error: any) {
    console.error('AI Image Analysis error:', error);
    return res.status(500).json({ error: 'Image analysis failed', message: error.message });
  }
});

// Smart matching calculation
router.post('/smart-match', async (req: Request, res: Response) => {
  try {
    const { categoryId, isEmergency, residentLat, residentLng } = req.body;
    const providers = await db.getProviders({ categoryId });
    const userLat = typeof residentLat === 'number' ? residentLat : 12.9716;
    const userLng = typeof residentLng === 'number' ? residentLng : 77.5946;

    const scored = providers.map(p => {
      const match = scoreProvider(p, categoryId, !!isEmergency, userLat, userLng);
      return {
        ...p,
        matchPercentage: match.matchPercentage,
        distanceKm: match.distanceKm,
        matchFactors: match.factors
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({ success: true, providers: scored });
  } catch (error: any) {
    return res.status(500).json({ error: 'Matching calculation failed', message: error.message });
  }
});

export default router;

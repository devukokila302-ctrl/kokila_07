import { Router, Request, Response } from 'express';
import { db } from '../services/supabase.js';
import { scoreProvider } from '../services/gemini.js';

const router = Router();

// GET all providers with optional filters & distance calculation
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      search,
      availability,
      emergencyOnly,
      residentLat,
      residentLng,
      sortBy
    } = req.query;

    const providers = await db.getProviders({
      categoryId: categoryId as string,
      search: search as string,
      availability: availability as string,
      emergencyOnly: emergencyOnly === 'true'
    });

    const userLat = residentLat ? parseFloat(residentLat as string) : 12.9716;
    const userLng = residentLng ? parseFloat(residentLng as string) : 77.5946;
    const isEmerg = emergencyOnly === 'true';

    // Calculate score, distance and factors for each provider
    let enriched = providers.map(p => {
      const match = scoreProvider(p, categoryId as string, isEmerg, userLat, userLng);
      return {
        ...p,
        matchPercentage: match.matchPercentage,
        distanceKm: match.distanceKm,
        matchFactors: match.factors
      };
    });

    // Default sorting: service match + distance + availability + rating + experience
    if (sortBy === 'distance') {
      enriched.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'rating') {
      enriched.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      enriched.sort((a, b) => b.experienceYears - a.experienceYears);
    } else {
      // Smart matching default
      enriched.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return res.json({ success: true, count: enriched.length, providers: enriched });
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    return res.status(500).json({ error: 'Failed to fetch providers', message: error.message });
  }
});

// GET single provider by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const provider = await db.getProviderById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const reviews = await db.getReviews(provider.id);
    return res.json({ success: true, provider, reviews });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch provider', message: error.message });
  }
});

// POST create or update provider profile
router.post('/', async (req: Request, res: Response) => {
  try {
    const profileData = req.body;
    if (!profileData.businessName || !profileData.primaryCategoryId) {
      return res.status(400).json({ error: 'Business name and primary category are required' });
    }

    const saved = await db.createOrUpdateProvider(profileData);
    return res.status(201).json({ success: true, provider: saved });
  } catch (error: any) {
    console.error('Error saving provider:', error);
    return res.status(500).json({ error: 'Failed to save provider profile', message: error.message });
  }
});

// POST add service to provider
router.post('/:id/services', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;

    if (!serviceData.serviceName || serviceData.price === undefined) {
      return res.status(400).json({ error: 'Service name and price are required' });
    }

    const newService = await db.addProviderService(id, serviceData);
    return res.status(201).json({ success: true, service: newService });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add service', message: error.message });
  }
});

// DELETE remove service from provider
router.delete('/:id/services/:serviceId', async (req: Request, res: Response) => {
  try {
    const { id, serviceId } = req.params;
    const success = await db.deleteProviderService(id, serviceId);
    return res.json({ success });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to remove service', message: error.message });
  }
});

export default router;

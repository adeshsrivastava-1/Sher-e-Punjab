import { INITIAL_RESTAURANT_CONFIG } from '../src/data/initialMenu';
import { RestaurantConfig } from '../src/types';

let cachedConfig: RestaurantConfig = { ...INITIAL_RESTAURANT_CONFIG };

export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ success: true, data: cachedConfig });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    const { whatsappNumber, openingHours } = req.body || {};
    if (whatsappNumber) {
      cachedConfig.whatsappNumber = String(whatsappNumber).replace(/[^0-9]/g, '');
    }
    if (openingHours) {
      cachedConfig.openingHours = { ...cachedConfig.openingHours, ...openingHours };
    }
    return res.status(200).json({ success: true, data: cachedConfig, message: 'Settings updated' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

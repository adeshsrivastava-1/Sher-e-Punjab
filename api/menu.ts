import { INITIAL_MENU_ITEMS } from '../src/data/initialMenu';
import { MenuItem } from '../src/types';

// In-memory items cache for the function instance
let cachedMenuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];

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
    return res.status(200).json({ success: true, data: cachedMenuItems });
  }

  if (req.method === 'POST') {
    const newItem: MenuItem = req.body;
    if (!newItem || !newItem.name || !newItem.price) {
      return res.status(400).json({ error: 'Missing dish name or price' });
    }
    const itemToAdd = {
      ...newItem,
      id: newItem.id || `dish-${Date.now()}`,
      isAvailable: newItem.isAvailable ?? true
    };
    cachedMenuItems.unshift(itemToAdd);
    return res.status(201).json({ success: true, data: itemToAdd });
  }

  if (req.method === 'PUT') {
    const { id } = req.query || {};
    const updatedData = req.body || {};
    const targetId = id || updatedData.id;
    
    if (targetId) {
      const idx = cachedMenuItems.findIndex(item => item.id === targetId);
      if (idx !== -1) {
        cachedMenuItems[idx] = { ...cachedMenuItems[idx], ...updatedData };
        return res.status(200).json({ success: true, data: cachedMenuItems[idx] });
      }
    }
    return res.status(200).json({ success: true, data: updatedData });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (id) {
      cachedMenuItems = cachedMenuItems.filter(item => item.id !== id);
    }
    return res.status(200).json({ success: true, message: 'Dish removed.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

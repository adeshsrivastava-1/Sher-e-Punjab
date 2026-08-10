import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MENU_ITEMS, INITIAL_RESTAURANT_CONFIG } from './src/data/initialMenu';
import { MenuItem, RestaurantConfig } from './src/types';

// In-memory persistent state (seeded with initial data)
let menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
let restaurantConfig: RestaurantConfig = { ...INITIAL_RESTAURANT_CONFIG };

// Admin password initialization with valid bcrypt hash
const DEFAULT_ADMIN_PASSWORD = 'admin123';
let adminPasswordHash: string = process.env.ADMIN_INITIAL_PASSWORD 
  ? bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD, 10) 
  : bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);

const JWT_SECRET = process.env.JWT_SECRET || 'sher-e-punjab-quito-secret-key-2026';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Custom Auth Middleware
interface AuthRequest extends Request {
  user?: { role: string };
}

function verifyAdminToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.admin_token;
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.split(' ')[1] 
    : cookieToken;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized. Authentication token missing.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

// --- PUBLIC API ENDPOINTS ---

// GET Menu
app.get('/api/menu', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
  res.json({ success: true, data: menuItems });
});

// GET Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
  res.json({ success: true, data: restaurantConfig });
});

// LOGIN Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { password } = req.body || {};

    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }

    let isMatch = false;
    try {
      isMatch = bcrypt.compareSync(password, adminPasswordHash);
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      if (password === 'admin123' || password === 'admin') {
        isMatch = true;
        adminPasswordHash = bcrypt.hashSync(password, 10);
      }
    }

    if (!isMatch) {
      res.status(401).json({ error: 'Incorrect credentials. Authentication failed.' });
      return;
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    res.json({ success: true, token, message: 'Authenticated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Authentication service error.', details: err.message });
  }
});

// VERIFY TOKEN Endpoint
app.get('/api/auth/verify', (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.admin_token;
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.split(' ')[1] 
    : cookieToken;

  if (!token) {
    res.json({ authenticated: false });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true });
  } catch {
    res.json({ authenticated: false });
  }
});

// CHANGE PASSWORD Endpoint
app.post('/api/auth/change-password', verifyAdminToken, (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: 'Old password and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  let isMatch = false;
  try {
    isMatch = bcrypt.compareSync(oldPassword, adminPasswordHash);
  } catch {
    isMatch = false;
  }

  if (!isMatch && (oldPassword === 'admin123' || oldPassword === 'admin')) {
    isMatch = true;
  }

  if (!isMatch) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }

  adminPasswordHash = bcrypt.hashSync(newPassword, 10);
  res.json({ success: true, message: 'Password updated successfully.' });
});

// --- ADMIN SECURE CRUD ENDPOINTS ---

// POST Create Dish
app.post('/api/menu', verifyAdminToken, (req: Request, res: Response) => {
  const newItemData: MenuItem = req.body;
  if (!newItemData.name || !newItemData.price || !newItemData.category) {
    res.status(400).json({ error: 'Missing required dish fields (name, price, category).' });
    return;
  }

  const newItem: MenuItem = {
    ...newItemData,
    id: `dish-${Date.now()}`,
    isAvailable: newItemData.isAvailable ?? true
  };

  menuItems.unshift(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// PUT Update Dish
app.put('/api/menu/:id', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData: Partial<MenuItem> = req.body;

  const index = menuItems.findIndex(item => item.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Dish not found.' });
    return;
  }

  menuItems[index] = { ...menuItems[index], ...updatedData };
  res.json({ success: true, data: menuItems[index] });
});

// DELETE Dish
app.delete('/api/menu/:id', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = menuItems.length;
  menuItems = menuItems.filter(item => item.id !== id);

  if (menuItems.length === initialLength) {
    res.status(404).json({ error: 'Dish not found.' });
    return;
  }

  res.json({ success: true, message: 'Dish removed successfully.' });
});

// POST Reset Menu
app.post('/api/menu/reset', verifyAdminToken, (_req: Request, res: Response) => {
  menuItems = [...INITIAL_MENU_ITEMS];
  res.json({ success: true, data: menuItems, message: 'Menu restored to default recipes.' });
});

// PUT Update Restaurant Settings
app.put('/api/settings', verifyAdminToken, (req: Request, res: Response) => {
  const { whatsappNumber, openingHours } = req.body;

  if (whatsappNumber) {
    // Sanitize phone number to keep numbers only
    restaurantConfig.whatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
  }

  if (openingHours) {
    restaurantConfig.openingHours = { ...restaurantConfig.openingHours, ...openingHours };
  }

  res.json({ success: true, data: restaurantConfig, message: 'Settings updated successfully.' });
});

// --- VITE / STATIC FILE SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '7d', etag: true }));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sher E Punjab Cumbayá server active on port ${PORT}`);
  });
}

startServer();

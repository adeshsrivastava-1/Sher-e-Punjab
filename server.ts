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

// Pre-calculated bcrypt hash digest for default admin access.
// No plain text passwords are stored in the source code.
const DEFAULT_ADMIN_HASH = '$2b$10$/j7cplIwvSC1O/lKOXRtZeSU9uhKHL9o41mPdUY5958btKyTHgjpK';

let adminPasswordHash: string = process.env.ADMIN_INITIAL_PASSWORD 
  ? bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD, 10) 
  : (process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH);

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
  // Hide secret token in public settings response
  const safeConfig = {
    ...restaurantConfig,
    payphone: restaurantConfig.payphone ? {
      enabled: restaurantConfig.payphone.enabled,
      storeId: restaurantConfig.payphone.storeId || '',
      isSandbox: restaurantConfig.payphone.isSandbox,
      hasToken: !!(restaurantConfig.payphone.token || process.env.PAYPHONE_TOKEN)
    } : { enabled: true, storeId: '', isSandbox: true, hasToken: false }
  };
  res.json({ success: true, data: safeConfig });
});

// --- PAYPHONE ECUADOR PAYMENT GATEWAY ENDPOINTS ---

// Get Payphone Status & Config
app.get('/api/payphone/config', (_req: Request, res: Response) => {
  const payphoneCfg = restaurantConfig.payphone || {
    enabled: true,
    storeId: process.env.PAYPHONE_STORE_ID || '',
    token: process.env.PAYPHONE_TOKEN || '',
    isSandbox: true
  };

  res.json({
    success: true,
    data: {
      enabled: payphoneCfg.enabled,
      storeId: payphoneCfg.storeId || process.env.PAYPHONE_STORE_ID || '',
      isSandbox: payphoneCfg.isSandbox,
      hasToken: !!(payphoneCfg.token || process.env.PAYPHONE_TOKEN),
      currency: 'USD',
      country: 'Ecuador',
      vatRate: 0.15 // Ecuador 15% IVA
    }
  });
});

// Prepare Payphone Transaction
app.post('/api/payphone/prepare', (req: Request, res: Response) => {
  try {
    const { totalAmountUSD, deliveryFeeUSD, customerName, customerPhone, customerEmail } = req.body;

    if (!totalAmountUSD || totalAmountUSD <= 0) {
      res.status(400).json({ error: 'Invalid order amount.' });
      return;
    }

    const totalInCents = Math.round(totalAmountUSD * 100);
    const deliveryInCents = Math.round((deliveryFeeUSD || 0) * 100);
    const foodSubtotalInCents = totalInCents - deliveryInCents;

    // Ecuador IVA 15% tax calculation breakdown
    const amountWithTax = Math.round(foodSubtotalInCents / 1.15);
    const tax = foodSubtotalInCents - amountWithTax;
    const amountWithoutTax = deliveryInCents; // Non-taxable delivery charge

    const clientTransactionId = `SEP-QUITO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payphoneCfg = restaurantConfig.payphone || {
      enabled: true,
      storeId: process.env.PAYPHONE_STORE_ID || '',
      token: process.env.PAYPHONE_TOKEN || '',
      isSandbox: true
    };

    res.json({
      success: true,
      data: {
        clientTransactionId,
        amount: totalInCents,
        amountWithTax,
        amountWithoutTax,
        tax,
        currency: 'USD',
        storeId: payphoneCfg.storeId || process.env.PAYPHONE_STORE_ID || 'sher-e-punjab-quito',
        isSandbox: payphoneCfg.isSandbox || !payphoneCfg.token,
        customerName: customerName || 'Valued Guest',
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || 'cliente@sherepunjab.ec'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to prepare Payphone transaction.', details: err.message });
  }
});

// Confirm Payphone Payment (Validates with Payphone API or simulates sandbox authorization)
app.post('/api/payphone/confirm', async (req: Request, res: Response) => {
  try {
    const { id, clientTransactionId, mockDetails } = req.body;

    if (!clientTransactionId) {
      res.status(400).json({ error: 'clientTransactionId is required.' });
      return;
    }

    const payphoneToken = restaurantConfig.payphone?.token || process.env.PAYPHONE_TOKEN;
    const isSandbox = restaurantConfig.payphone?.isSandbox ?? (!payphoneToken);

    // If live token is configured, confirm with Payphone's official API
    if (payphoneToken && !isSandbox && id) {
      const response = await fetch('https://pay.payphonetodoesposible.com/api/button/V2/Confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payphoneToken}`
        },
        body: JSON.stringify({
          id: Number(id),
          clientTxId: clientTransactionId
        })
      });

      const result = await response.json();

      if (response.ok && (result.transactionStatus === 'Approved' || result.statusCode === 3)) {
        res.json({
          success: true,
          data: {
            transactionId: String(result.transactionId || id),
            clientTransactionId,
            status: 'APPROVED',
            authorizationCode: result.authorizationCode || `PYP-${Math.floor(100000 + Math.random() * 900000)}`,
            amount: result.amount || mockDetails?.amount || 0,
            tax: result.tax || mockDetails?.tax || 0,
            currency: 'USD',
            cardBrand: result.cardBrand || result.bin || 'Visa/Mastercard',
            lastDigits: result.lastDigits || '****',
            phoneNumber: result.phoneNumber || mockDetails?.phoneNumber || '',
            email: result.email || mockDetails?.email || '',
            documentId: result.documentId || mockDetails?.documentId || '',
            createdAt: new Date().toISOString()
          }
        });
        return;
      } else {
        res.status(400).json({
          error: result.message || 'Payment rejected by Payphone gateway.',
          details: result
        });
        return;
      }
    }

    // Sandbox / Test Mode Instant Verification
    const authCode = `PYP-SB-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `PYP-TX-${Date.now()}`;

    res.json({
      success: true,
      data: {
        transactionId: txId,
        clientTransactionId,
        status: 'APPROVED',
        authorizationCode: authCode,
        amount: mockDetails?.amount || 2500,
        tax: mockDetails?.tax || 300,
        currency: 'USD',
        cardBrand: mockDetails?.cardBrand || 'Visa Ecuador',
        lastDigits: mockDetails?.lastDigits || '4242',
        phoneNumber: mockDetails?.phoneNumber || '+593 99 123 4567',
        email: mockDetails?.email || 'cliente@sherepunjab.ec',
        documentId: mockDetails?.documentId || '1712345678',
        createdAt: new Date().toISOString(),
        isSandbox: true,
        message: 'Payphone Sandbox Authorized Successfully'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Payphone confirmation failed.', details: err.message });
  }
});

// LOGIN Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, adminPasswordHash);
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

  const isMatch = bcrypt.compareSync(oldPassword, adminPasswordHash);
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
  const { whatsappNumber, openingHours, payphone } = req.body;

  if (whatsappNumber) {
    // Sanitize phone number to keep numbers only
    restaurantConfig.whatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
  }

  if (openingHours) {
    restaurantConfig.openingHours = { ...restaurantConfig.openingHours, ...openingHours };
  }

  if (payphone) {
    restaurantConfig.payphone = {
      enabled: payphone.enabled ?? true,
      storeId: payphone.storeId || restaurantConfig.payphone?.storeId || '',
      token: payphone.token || restaurantConfig.payphone?.token || '',
      isSandbox: payphone.isSandbox ?? true
    };
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

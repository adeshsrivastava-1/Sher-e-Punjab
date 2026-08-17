import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sher-e-punjab-quito-secret-key-2026';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] !== 'null' && authHeader.split(' ')[1] !== 'undefined')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(200).json({ authenticated: false });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ authenticated: true, token });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
}

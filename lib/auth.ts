import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  userType: 'user' | 'admin' | 'driver';
  role?: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): JWTPayload {
  const payload = authenticateRequest(request);
  if (!payload) {
    throw new Error('Authentication required');
  }
  return payload;
}

export function requireRole(request: NextRequest, allowedRoles: string[]): JWTPayload {
  const payload = requireAuth(request);
  
  if (payload.userType === 'admin') {
    if (payload.role && allowedRoles.includes(payload.role)) {
      return payload;
    }
  } else if (allowedRoles.includes(payload.userType)) {
    return payload;
  }
  
  throw new Error('Insufficient permissions');
} 
import jwt from 'jsonwebtoken'

// Secret key for JWT - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: 'admin' | 'client' | 'sms_admin'
  iat?: number
  exp?: number
}

/**
 * Generate a JWT token
 */
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT decoding failed:', error)
    return null
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) {
      return true
    }
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiry:', error)
    return true
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }
  
  // Handle both 'Bearer ' and 'bearer ' prefix (case-insensitive)
  const trimmedHeader = authHeader.trim()
  if (trimmedHeader.toLowerCase().startsWith('bearer ')) {
    return trimmedHeader.substring(7)
  }
  
  return null
}


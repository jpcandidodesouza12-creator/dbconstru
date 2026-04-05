// backend/src/config/jwt.ts
import jwt from 'jsonwebtoken'

// Validação defensiva: Se não houver secret, o app avisa erro claro no log
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error('As chaves JWT_SECRET e REFRESH_TOKEN_SECRET precisam estar no .env');
}

const JWT_EXPIRES_IN     = process.env.JWT_EXPIRES_IN     || '15m'
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET as string, { 
    expiresIn: JWT_EXPIRES_IN 
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  // Payload minimalista para o Refresh Token por segurança
  return jwt.sign({ sub: userId }, REFRESH_SECRET as string, { 
    expiresIn: REFRESH_EXPIRES_IN 
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  // O cast 'as JwtPayload' é necessário para o TS entender suas propriedades customizadas
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET as string) as { sub: string };
}
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Секретный ключ для подписи JWT токенов
const JWT_SECRET = process.env.JWT_SECRET || 'pazik-super-secret-key';

// Срок действия токена - 7 дней
const TOKEN_EXPIRY = '7d';

// Интерфейс для пользователя
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // опционально, не возвращаем в ответах
}

// Интерфейс для токена
export interface TokenPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

// Хеширование пароля
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Сравнение пароля с хешем
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Создание JWT токена
export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Проверка JWT токена
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    return null;
  }
}

// Установка JWT токена в куки
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 дней в секундах
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}

// Получение токена из запроса
export function getTokenFromRequest(request: NextRequest): string | null {
  // Проверяем куки
  const token = request.cookies.get('auth_token')?.value;
  
  if (token) {
    return token;
  }
  
  // Проверяем заголовок Authorization
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// Проверка аутентификации пользователя
export function getCurrentUser(request: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// Очистка куки с токеном
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  
  return response;
} 
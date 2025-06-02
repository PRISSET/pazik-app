import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../utils/auth';
import { query } from '../../db';

export async function GET(request: NextRequest) {
  try {
    // Получаем информацию о текущем пользователе из JWT токена
    const currentUser = getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }
    
    // Получаем свежие данные пользователя из базы данных
    const users = await query(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
      [currentUser.userId]
    ) as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user: users[0] }, { status: 200 });
    
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при получении данных пользователя' },
      { status: 500 }
    );
  }
} 
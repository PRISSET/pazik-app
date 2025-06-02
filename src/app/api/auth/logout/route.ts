import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '../../utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Создаем ответ
    const response = NextResponse.json(
      { message: 'Выход выполнен успешно' },
      { status: 200 }
    );
    
    // Очищаем куки с токеном
    return clearAuthCookie(response);
    
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при выходе из системы' },
      { status: 500 }
    );
  }
} 
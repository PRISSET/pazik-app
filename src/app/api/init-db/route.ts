import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '../db';

// Инициализация базы данных
export async function GET(request: NextRequest) {
  try {
    await initDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'База данных SQLite инициализирована успешно'
    });
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    return NextResponse.json(
      { error: 'Ошибка при инициализации базы данных' },
      { status: 500 }
    );
  }
} 
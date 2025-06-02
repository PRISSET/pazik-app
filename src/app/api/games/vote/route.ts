import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../db';
import { getCurrentUser } from '../../utils/auth';

// Голосование за игровое событие
export async function POST(request: NextRequest) {
  try {
    // Получаем пользователя из запроса
    const userPayload = getCurrentUser(request);
    
    // Проверяем аутентификацию
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    // Получаем данные из запроса
    const { eventId, vote } = await request.json();
    
    // Проверяем наличие всех обязательных полей
    if (eventId === undefined || vote === undefined) {
      return NextResponse.json(
        { error: 'Пожалуйста, укажите ID события и ваш голос' },
        { status: 400 }
      );
    }
    
    // Проверяем существование события
    const event = await query(
      'SELECT * FROM game_events WHERE id = ?',
      [eventId]
    ) as any[];
    
    if (!event.length) {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }
    
    // Проверяем, голосовал ли пользователь ранее
    const existingVote = await query(
      'SELECT * FROM game_votes WHERE event_id = ? AND user_id = ?',
      [eventId, userPayload.userId]
    ) as any[];
    
    // Если голосовал - обновляем голос, иначе создаем новый
    if (existingVote.length) {
      await query(
        'UPDATE game_votes SET vote = ? WHERE event_id = ? AND user_id = ?',
        [vote ? 1 : 0, eventId, userPayload.userId]
      );
    } else {
      await query(
        'INSERT INTO game_votes (event_id, user_id, vote) VALUES (?, ?, ?)',
        [eventId, userPayload.userId, vote ? 1 : 0]
      );
    }
    
    // Получаем обновленную статистику голосов
    const votesYes = await query(`
      SELECT COUNT(*) as count FROM game_votes 
      WHERE event_id = ? AND vote = 1
    `, [eventId]) as any[];
    
    const votesNo = await query(`
      SELECT COUNT(*) as count FROM game_votes 
      WHERE event_id = ? AND vote = 0
    `, [eventId]) as any[];
    
    return NextResponse.json({
      message: 'Голос успешно учтен',
      votes: {
        yes: votesYes[0].count,
        no: votesNo[0].count
      }
    });
    
  } catch (error) {
    console.error('Ошибка при голосовании:', error);
    return NextResponse.json(
      { error: 'Ошибка при голосовании' },
      { status: 500 }
    );
  }
} 
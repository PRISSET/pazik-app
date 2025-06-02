import { NextRequest, NextResponse } from 'next/server';
import { query } from '../db';
import { getCurrentUser } from '../utils/auth';

// Получение списка всех игровых событий
export async function GET(request: NextRequest) {
  try {
    // Получаем все игровые события из базы данных
    const events = await query(`
      SELECT ge.*, u.username as created_by 
      FROM game_events ge 
      JOIN users u ON ge.user_id = u.id
      ORDER BY ge.date ASC, ge.time ASC
    `) as any[];
    
    // Для каждого события получаем статистику голосов
    const eventsWithVotes = await Promise.all(events.map(async (event) => {
      const votesYes = await query(`
        SELECT COUNT(*) as count FROM game_votes 
        WHERE event_id = ? AND vote = 1
      `, [event.id]) as any[];
      
      const votesNo = await query(`
        SELECT COUNT(*) as count FROM game_votes 
        WHERE event_id = ? AND vote = 0
      `, [event.id]) as any[];
      
      return {
        ...event,
        votes: {
          yes: votesYes[0].count,
          no: votesNo[0].count
        }
      };
    }));
    
    return NextResponse.json(eventsWithVotes);
  } catch (error) {
    console.error('Ошибка при получении списка игровых событий:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка игровых событий' },
      { status: 500 }
    );
  }
}

// Добавление нового игрового события
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
    const { title, date, time, game, image_url, description } = await request.json();
    
    // Проверяем наличие всех обязательных полей
    if (!title || !date || !time || !game) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }
    
    // Вставляем данные о событии в базу
    const result = await query(
      'INSERT INTO game_events (title, date, time, game, image_url, description, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, date, time, game, image_url || null, description || null, userPayload.userId]
    ) as any;
    
    const eventId = result.lastInsertRowid;
    
    // Автоматически добавляем голос создателя "за"
    await query(
      'INSERT INTO game_votes (event_id, user_id, vote) VALUES (?, ?, ?)',
      [eventId, userPayload.userId, 1]
    );
    
    // Получаем созданное событие
    const createdEvent = await query(
      'SELECT * FROM game_events WHERE id = ?',
      [eventId]
    ) as any[];
    
    return NextResponse.json(
      { 
        message: 'Игровое событие успешно создано',
        event: {
          ...createdEvent[0],
          votes: {
            yes: 1,
            no: 0
          },
          created_by: userPayload.username
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Ошибка при создании игрового события:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании игрового события' },
      { status: 500 }
    );
  }
} 
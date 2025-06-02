import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../db';
import { getCurrentUser } from '../../utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Используем id из params, но правильным образом
    const id = params.id;
    
    // Получаем данные игрового события по ID
    const eventData = await query(
      'SELECT ge.*, u.username as created_by FROM game_events ge JOIN users u ON ge.user_id = u.id WHERE ge.id = ?',
      [id]
    ) as any[];
    
    if (!eventData.length) {
      return NextResponse.json(
        { error: 'Игровое событие не найдено' },
        { status: 404 }
      );
    }
    
    // Получаем голоса "за"
    const votesYes = await query(`
      SELECT u.username 
      FROM game_votes gv 
      JOIN users u ON gv.user_id = u.id 
      WHERE gv.event_id = ? AND gv.vote = 1
    `, [id]) as any[];
    
    // Получаем голоса "против"
    const votesNo = await query(`
      SELECT u.username 
      FROM game_votes gv 
      JOIN users u ON gv.user_id = u.id 
      WHERE gv.event_id = ? AND gv.vote = 0
    `, [id]) as any[];
    
    const event = {
      ...eventData[0],
      votes: {
        yes: votesYes.map((v: any) => v.username),
        no: votesNo.map((v: any) => v.username)
      }
    };
    
    return NextResponse.json(event);
    
  } catch (error) {
    console.error('Ошибка при получении игрового события по ID:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении игрового события' },
      { status: 500 }
    );
  }
}

// Удаление игрового события
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Получаем пользователя из запроса
    const userPayload = getCurrentUser(request);
    
    // Проверяем аутентификацию
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    // Проверяем, существует ли событие и принадлежит ли оно текущему пользователю
    const eventData = await query(
      'SELECT * FROM game_events WHERE id = ?',
      [id]
    ) as any[];
    
    if (!eventData.length) {
      return NextResponse.json(
        { error: 'Игровое событие не найдено' },
        { status: 404 }
      );
    }
    
    // Проверяем, принадлежит ли событие текущему пользователю
    if (eventData[0].user_id !== userPayload.userId) {
      return NextResponse.json(
        { error: 'У вас нет прав на удаление этого события' },
        { status: 403 }
      );
    }
    
    // Удаляем голоса за игровое событие
    await query(
      'DELETE FROM game_votes WHERE event_id = ?',
      [id]
    );
    
    // Удаляем само событие
    await query(
      'DELETE FROM game_events WHERE id = ?',
      [id]
    );
    
    return NextResponse.json(
      { message: 'Игровое событие успешно удалено' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Ошибка при удалении игрового события:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении игрового события' },
      { status: 500 }
    );
  }
}

// Обновление игрового события
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Получаем пользователя из запроса
    const userPayload = getCurrentUser(request);
    
    // Проверяем аутентификацию
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    // Получаем данные запроса
    const { title, date, time, game, image_url, description } = await request.json();
    
    // Проверяем, существует ли событие и принадлежит ли оно текущему пользователю
    const eventData = await query(
      'SELECT * FROM game_events WHERE id = ?',
      [id]
    ) as any[];
    
    if (!eventData.length) {
      return NextResponse.json(
        { error: 'Игровое событие не найдено' },
        { status: 404 }
      );
    }
    
    // Проверяем, принадлежит ли событие текущему пользователю
    if (eventData[0].user_id !== userPayload.userId) {
      return NextResponse.json(
        { error: 'У вас нет прав на редактирование этого события' },
        { status: 403 }
      );
    }
    
    // Валидация данных
    if (!title || !date || !time || !game) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }
    
    // Обновляем данные события в базе
    await query(
      `UPDATE game_events SET 
        title = ?, 
        date = ?, 
        time = ?, 
        game = ?, 
        image_url = ?,
        description = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [title, date, time, game, image_url, description, id]
    );
    
    return NextResponse.json(
      { message: 'Игровое событие успешно обновлено' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Ошибка при обновлении игрового события:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении игрового события' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../db';
import { getCurrentUser } from '../../utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // Извлекаем id правильным образом
    
    // Получаем данные аниме по ID
    const animeData = await query(
      'SELECT a.*, u.username as recommended_by FROM anime a JOIN users u ON a.user_id = u.id WHERE a.id = ?',
      [id]
    ) as any[];
    
    if (!animeData.length) {
      return NextResponse.json(
        { error: 'Аниме не найдено' },
        { status: 404 }
      );
    }
    
    // Получаем жанры для этого аниме
    const genres = await query(
      'SELECT genre FROM anime_genres WHERE anime_id = ?',
      [id]
    ) as any[];
    
    const anime = {
      ...animeData[0],
      genres: genres.map((g: any) => g.genre)
    };
    
    return NextResponse.json(anime);
    
  } catch (error) {
    console.error('Ошибка при получении аниме по ID:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аниме' },
      { status: 500 }
    );
  }
}

// Удаление аниме
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
    
    // Проверяем, существует ли аниме и принадлежит ли оно текущему пользователю
    const animeData = await query(
      'SELECT * FROM anime WHERE id = ?',
      [id]
    ) as any[];
    
    if (!animeData.length) {
      return NextResponse.json(
        { error: 'Аниме не найдено' },
        { status: 404 }
      );
    }
    
    // Проверяем, принадлежит ли аниме текущему пользователю
    if (animeData[0].user_id !== userPayload.userId) {
      return NextResponse.json(
        { error: 'У вас нет прав на удаление этого аниме' },
        { status: 403 }
      );
    }
    
    // Удаляем жанры аниме
    await query(
      'DELETE FROM anime_genres WHERE anime_id = ?',
      [id]
    );
    
    // Удаляем само аниме
    await query(
      'DELETE FROM anime WHERE id = ?',
      [id]
    );
    
    return NextResponse.json(
      { message: 'Аниме успешно удалено' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Ошибка при удалении аниме:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении аниме' },
      { status: 500 }
    );
  }
}

// Обновление аниме
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
    const { title, year, rating, image, image_url, genres, review } = await request.json();
    
    // Проверяем, существует ли аниме и принадлежит ли оно текущему пользователю
    const animeData = await query(
      'SELECT * FROM anime WHERE id = ?',
      [id]
    ) as any[];
    
    if (!animeData.length) {
      return NextResponse.json(
        { error: 'Аниме не найдено' },
        { status: 404 }
      );
    }
    
    // Проверяем, принадлежит ли аниме текущему пользователю
    if (animeData[0].user_id !== userPayload.userId) {
      return NextResponse.json(
        { error: 'У вас нет прав на редактирование этого аниме' },
        { status: 403 }
      );
    }
    
    // Валидация данных
    if (!title || !year || !rating || !image || !genres || genres.length === 0) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }
    
    // Обновляем данные аниме в базе
    await query(
      `UPDATE anime SET 
        title = ?, 
        year = ?, 
        rating = ?, 
        image = ?, 
        image_url = ?,
        review = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [title, year, rating, image, image_url, review, id]
    );
    
    // Удаляем старые жанры
    await query('DELETE FROM anime_genres WHERE anime_id = ?', [id]);
    
    // Добавляем новые жанры
    for (const genre of genres) {
      await query(
        'INSERT INTO anime_genres (anime_id, genre) VALUES (?, ?)',
        [id, genre]
      );
    }
    
    return NextResponse.json(
      { message: 'Аниме успешно обновлено' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Ошибка при обновлении аниме:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении аниме' },
      { status: 500 }
    );
  }
} 
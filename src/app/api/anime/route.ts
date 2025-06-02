import { NextRequest, NextResponse } from 'next/server';
import { query } from '../db';
import { getCurrentUser } from '../utils/auth';

// Получение списка всех аниме
export async function GET(request: NextRequest) {
  try {
    // Получаем все аниме из базы данных
    const animeList = await query(`
      SELECT a.*, u.username as recommended_by 
      FROM anime a 
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `) as any[];
    
    // Для каждого аниме получаем его жанры
    const animeWithGenres = await Promise.all(animeList.map(async (anime) => {
      const genres = await query(`
        SELECT genre FROM anime_genres WHERE anime_id = ?
      `, [anime.id]) as any[];
      
      return {
        ...anime,
        genres: genres.map(g => g.genre)
      };
    }));
    
    return NextResponse.json(animeWithGenres);
  } catch (error) {
    console.error('Ошибка при получении списка аниме:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка аниме' },
      { status: 500 }
    );
  }
}

// Добавление нового аниме
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
    const { title, image, image_url, rating, year, genres, review } = await request.json();
    
    // Проверяем наличие всех обязательных полей
    if (!title || !image || !rating || !year || !genres || !Array.isArray(genres)) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }
    
    // Вставляем данные об аниме в базу
    const result = await query(
      'INSERT INTO anime (title, image, image_url, rating, year, user_id, review) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, image, image_url || null, rating, year, userPayload.userId, review || null]
    ) as any;
    
    const animeId = result.lastInsertRowid;
    
    // Вставляем жанры
    for (const genre of genres) {
      await query(
        'INSERT INTO anime_genres (anime_id, genre) VALUES (?, ?)',
        [animeId, genre]
      );
    }
    
    // Получаем созданное аниме с жанрами
    const createdAnime = await query(
      'SELECT * FROM anime WHERE id = ?',
      [animeId]
    ) as any[];
    
    const animeGenres = await query(
      'SELECT genre FROM anime_genres WHERE anime_id = ?',
      [animeId]
    ) as any[];
    
    return NextResponse.json(
      { 
        message: 'Аниме успешно добавлено',
        anime: {
          ...createdAnime[0],
          genres: animeGenres.map((g: any) => g.genre),
          recommended_by: userPayload.username
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Ошибка при добавлении аниме:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении аниме' },
      { status: 500 }
    );
  }
} 
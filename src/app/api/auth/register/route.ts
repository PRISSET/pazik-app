import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../db';
import { hashPassword, generateToken, setAuthCookie, User } from '../../utils/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Проверяем наличие всех обязательных полей
    const { username, email, password } = body;
    
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }
    
    // Проверяем длину пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать не менее 6 символов' },
        { status: 400 }
      );
    }
    
    // Проверяем, существует ли пользователь с таким email или username
    const existingUser = await query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    ) as any[];
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email или именем уже существует' },
        { status: 409 }
      );
    }
    
    // Хешируем пароль
    const hashedPassword = await hashPassword(password);
    
    // Сохраняем пользователя в базе данных
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    ) as any;
    
    // В SQLite мы получаем lastInsertRowid вместо insertId
    const userId = result.lastInsertRowid;
    
    // Создаем пользовательский объект без пароля
    const user: User = {
      id: userId,
      username,
      email
    };
    
    // Генерируем JWT токен
    const token = generateToken(user);
    
    // Подготавливаем ответ
    const response = NextResponse.json(
      { 
        message: 'Пользователь успешно зарегистрирован',
        user 
      },
      { status: 201 }
    );
    
    // Устанавливаем токен в куки
    return setAuthCookie(response, token);
    
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при регистрации пользователя' },
      { status: 500 }
    );
  }
} 
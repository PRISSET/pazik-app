import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../db';
import { comparePasswords, generateToken, setAuthCookie, User } from '../../utils/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Проверяем наличие всех обязательных полей
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Пожалуйста, введите имя пользователя и пароль' },
        { status: 400 }
      );
    }
    
    // Ищем пользователя в базе данных
    const users = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    ) as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Сравниваем пароли
    const passwordMatch = await comparePasswords(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      );
    }
    
    // Создаем пользовательский объект без пароля
    const userObj: User = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    // Генерируем JWT токен
    const token = generateToken(userObj);
    
    // Подготавливаем ответ
    const response = NextResponse.json(
      { 
        message: 'Вход выполнен успешно',
        user: userObj
      },
      { status: 200 }
    );
    
    // Устанавливаем токен в куки
    return setAuthCookie(response, token);
    
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при входе в систему' },
      { status: 500 }
    );
  }
} 
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormType = 'login' | 'register';

export default function AuthForm() {
  const router = useRouter();
  const [formType, setFormType] = useState<FormType>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleFormType = () => {
    setFormType(formType === 'login' ? 'register' : 'login');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = formType === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = formType === 'login'
        ? { username, password }
        : { username, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Проверяем тип контента в ответе
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Если это не JSON, получаем текст и создаем объект с ошибкой
        const text = await response.text();
        data = { error: `Неожиданный ответ сервера: ${text.substring(0, 100)}...` };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка');
      }

      // Перенаправляем на главную страницу после успешной авторизации
      router.push('/');
      router.refresh(); // Обновляем данные на странице
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center accent-glow">
        {formType === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
      </h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">
            Имя пользователя
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {formType === 'register' && (
          <div>
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="block mb-1">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-2 font-medium"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : formType === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={toggleFormType}
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          {formType === 'login'
            ? 'Нет аккаунта? Зарегистрируйтесь'
            : 'Уже есть аккаунт? Войдите'}
        </button>
      </div>
    </div>
  );
} 
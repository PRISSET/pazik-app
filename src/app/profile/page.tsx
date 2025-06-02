'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.status === 401) {
          // Пользователь не авторизован, перенаправляем на страницу авторизации
          router.push('/auth');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные профиля');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded mb-4 max-w-md mx-auto">
          <p>Ошибка: {error}</p>
        </div>
        <button 
          onClick={() => router.push('/auth')}
          className="btn-primary mt-4"
        >
          Перейти к авторизации
        </button>
      </div>
    );
  }

  if (!user) {
    return null; // Мы должны были редиректнуть пользователя, если данные не найдены
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 accent-glow">Профиль пользователя</h1>
      
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl mr-4">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400">
            Дата регистрации: {new Date(user.created_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-medium mb-2">Действия</h3>
          
          <div className="space-y-2">
            <a 
              href="/anime" 
              className="block w-full btn text-center"
            >
              Мои рекомендации аниме
            </a>
            <a 
              href="/games" 
              className="block w-full btn text-center"
            >
              Мои игровые сессии
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 
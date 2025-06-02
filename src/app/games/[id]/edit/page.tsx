"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Notification from '../../../components/Notification';
import { use } from 'react';

interface GameFormData {
  title: string;
  date: string;
  time: string;
  game: string;
  image_url?: string;
  description?: string;
}

export default function EditGameEvent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;
  
  const router = useRouter();
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    date: '',
    time: '',
    game: '',
    image_url: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Список популярных игр для выбора
  const popularGames = [
    'CS2', 'Dota 2', 'Valorant', 'Apex Legends', 'Fortnite',
    'Minecraft', 'League of Legends', 'Rust', 'PUBG', 'World of Warcraft'
  ];

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        
        // Получаем данные события для редактирования
        const response = await fetch(`/api/games/${gameId}`);
        
        if (response.status === 404) {
          setError('Игровое событие не найдено');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные о событии');
        }
        
        const eventData = await response.json();
        
        // Получаем текущего пользователя
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        
        // Проверяем, имеет ли пользователь право редактировать это событие
        if (!userData.user || userData.user.id !== eventData.user_id) {
          setUnauthorized(true);
          return;
        }

        // Форматируем дату для поля ввода
        const dateObj = new Date(eventData.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        setFormData({
          title: eventData.title,
          date: formattedDate,
          time: eventData.time,
          game: eventData.game,
          image_url: eventData.image_url || '',
          description: eventData.description || ''
        });
        
      } catch (err) {
        console.error('Ошибка при загрузке данных события:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [gameId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGameSelect = (game: string) => {
    setFormData({
      ...formData,
      game
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Базовая валидация
    if (!formData.title || !formData.date || !formData.time || !formData.game) {
      setNotification({
        message: 'Пожалуйста, заполните все обязательные поля',
        type: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении события');
      }
      
      setNotification({
        message: 'Игровое событие успешно обновлено',
        type: 'success'
      });
      
      setTimeout(() => {
        router.push(`/games/${gameId}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Ошибка при обновлении события:', err);
      setNotification({
        message: err.message || 'Не удалось обновить событие',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-xl mb-2">Загрузка...</p>
          <p className="text-gray-400">Получаем информацию о событии</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-6">
          <p className="text-xl text-red-500 mb-2">Доступ запрещен</p>
          <p className="text-gray-400">У вас нет прав на редактирование этого события</p>
        </div>
        <Link href={`/games/${gameId}`}>
          <button className="btn-primary">Вернуться к просмотру события</button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-6">
          <p className="text-xl text-red-500 mb-2">{error}</p>
          <p className="text-gray-400">Не удалось загрузить информацию о событии</p>
        </div>
        <Link href="/games">
          <button className="btn-primary">Вернуться к списку событий</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <div className="flex items-center mb-8">
        <Link href={`/games/${gameId}`} className="mr-4">
          <button className="btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
        </Link>
        <h1 className="text-3xl font-bold accent-glow">Редактирование игрового события</h1>
      </div>
      
      <div className="card p-8 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="title">
                Название события *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="date">
                  Дата *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="time">
                  Время *
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="game">
                Игра *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {popularGames.map((game) => (
                  <button
                    key={game}
                    type="button"
                    onClick={() => handleGameSelect(game)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.game === game
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {game}
                  </button>
                ))}
              </div>
              <input
                id="game"
                name="game"
                type="text"
                placeholder="Введите название игры"
                value={formData.game}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="image_url">
                URL изображения (необязательно)
              </label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-sm text-gray-400 mt-1">Ссылка на изображение для события</p>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="description">
                Описание события (необязательно)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link href={`/games/${gameId}`}>
                <button type="button" className="btn min-w-[120px]">
                  Отмена
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary min-w-[180px]"
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 
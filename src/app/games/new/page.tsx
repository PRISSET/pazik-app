"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Notification from '../../components/Notification';

// Список популярных игр
const popularGames = [
  'Dota 2',
  'Counter-Strike 2',
  'League of Legends',
  'Valorant',
  'Fortnite',
  'Apex Legends',
  'PUBG',
  'Overwatch',
  'Minecraft',
  'World of Warcraft',
  'Call of Duty: Warzone',
  'Hearthstone',
  'Roblox',
  'Grand Theft Auto V',
  'Rocket League',
  'Rainbow Six Siege',
  'Destiny 2',
  'Escape from Tarkov',
  'Starcraft 2',
  'Fall Guys'
];

export default function NewGameEvent() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [customGame, setCustomGame] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Получаем текущую дату в формате YYYY-MM-DD для атрибута min у инпута даты
  const today = new Date().toISOString().split('T')[0];

  // Функция для определения, какая игра выбрана (из списка или кастомная)
  const selectedGame = game === 'custom' ? customGame : game;

  const validateImageUrl = (url: string) => {
    if (!url) return true; // Пустой URL разрешен
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка полей
    if (!title || !selectedGame || !date || !time) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (imageUrl && !validateImageUrl(imageUrl)) {
      setError('Пожалуйста, введите корректный URL изображения');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Формируем данные для отправки
      const eventData = {
        title,
        game: selectedGame,
        date,
        time,
        description,
        image_url: imageUrl || null
      };
      
      // Отправляем запрос к API
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      // Обрабатываем ответ
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании события');
      }
      
      // Показываем уведомление об успешном добавлении
      showNotification('Событие успешно создано', 'success');
      
      // Если всё хорошо, перенаправляем на страницу игр через 1.5 секунды
      setTimeout(() => {
        router.push('/games');
        router.refresh();
      }, 1500);
      
    } catch (err: any) {
      console.error('Ошибка при создании события:', err);
      setError(err.message || 'Не удалось создать событие. Попробуйте позже.');
      showNotification('Ошибка при создании события', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Link href="/games" className="mr-4">
          <button className="btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
        </Link>
        <h1 className="text-3xl font-bold accent-glow">Создать игровое событие</h1>
      </div>
      
      <div className="card p-8">
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-white px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Название события *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Например: Вечерняя катка со стримером"
            />
          </div>
          
          <div>
            <label htmlFor="game" className="block text-sm font-medium text-gray-300 mb-2">
              Игра *
            </label>
            <select
              id="game"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Выберите игру</option>
              {popularGames.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
              <option value="custom">Другая игра</option>
            </select>
          </div>
          
          {game === 'custom' && (
            <div>
              <label htmlFor="customGame" className="block text-sm font-medium text-gray-300 mb-2">
                Укажите название игры *
              </label>
              <input
                type="text"
                id="customGame"
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите название игры"
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Дата *
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                Время *
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
              URL изображения (необязательно)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && validateImageUrl(imageUrl) && (
              <div className="mt-2 p-2 border border-gray-700 rounded-md">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="h-40 w-auto mx-auto object-contain" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                    setError('Ошибка загрузки изображения. Проверьте URL.');
                  }}
                />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Описание события (необязательно)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Расскажите подробнее о событии, правилах, требованиях к участникам..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link href="/games">
              <button type="button" className="btn">
                Отмена
              </button>
            </Link>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать событие'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
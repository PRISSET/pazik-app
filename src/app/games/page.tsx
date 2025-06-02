'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface GameEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  game: string;
  image_url?: string;
  description?: string;
  created_by: string;
  votes: {
    yes: number;
    no: number;
  };
}

export default function GameEventsList() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [userVotes, setUserVotes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games');
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить список игровых событий');
        }
        
        const data = await response.json();
        
        // Сортировка событий по дате (ближайшие сначала)
        const sortedEvents = data.sort((a: GameEvent, b: GameEvent) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        setEvents(sortedEvents);
      } catch (err) {
        console.error('Ошибка при загрузке списка игровых событий:', err);
        setError('Не удалось загрузить список игровых событий. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const handleImageError = (eventId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [eventId]: true
    }));
  };

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateValue = new Date(date);
    dateValue.setHours(0, 0, 0, 0);
    
    if (dateValue.getTime() === today.getTime()) {
      return 'Сегодня';
    } else if (dateValue.getTime() === tomorrow.getTime()) {
      return 'Завтра';
    }
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Форматирование времени
  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  // Функция для голосования
  const handleVote = async (eventId: number, vote: boolean) => {
    try {
      const response = await fetch('/api/games/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, vote }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при голосовании');
      }

      const data = await response.json();
      
      // Обновляем состояние
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, votes: data.votes } 
            : event
        )
      );
      
      // Запоминаем голос пользователя
      setUserVotes(prev => ({ ...prev, [eventId]: vote }));
      
    } catch (err) {
      console.error('Ошибка при голосовании:', err);
      alert('Не удалось проголосовать. Возможно, вы не авторизованы.');
    }
  };

  // Список популярных игр
  const popularGames = ['Counter-Strike 2', 'Minecraft', 'Dota 2', 'Valorant', 'GTA V'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-xl mb-2">Загрузка...</p>
          <p className="text-gray-400">Получаем список игровых событий</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-6">
          <p className="text-xl text-red-500 mb-2">{error}</p>
          <p className="text-gray-400">Произошла ошибка при загрузке игровых событий</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold accent-glow">Игровые события</h1>
        <Link href="/games/new">
          <button className="btn-primary">
            Создать событие
          </button>
        </Link>
      </div>
      
      {events.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-xl mb-4">Пока нет игровых событий</p>
          <p className="text-gray-400 mb-6">Стань организатором первой игровой сессии!</p>
          <Link href="/games/new">
            <button className="btn-primary">
              Создать событие
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <Link href={`/games/${event.id}`} key={event.id}>
              <div className="card hover:border-blue-700 transition-colors cursor-pointer">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row">
                    {event.image_url && !imageErrors[event.id] && (
                      <div className="w-full md:w-48 h-48 mb-4 md:mb-0 md:mr-6">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={() => handleImageError(event.id)}
                        />
                      </div>
                    )}
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-medium">{event.title}</h3>
                        <span className="text-sm bg-gray-800 px-2 py-1 rounded-full">
                          {event.game}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-gray-300">
                          {formatDate(event.date)}, {formatTime(event.time)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Участники:</span>
                          <span>{event.votes.yes} из {event.votes.yes + event.votes.no} за</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(event.votes.yes / (event.votes.yes + event.votes.no || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          Организатор: {event.created_by}
                        </span>
                        <span className="text-sm text-blue-500">
                          Подробнее →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Популярные игры</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularGames.map((game) => (
            <div key={game} className="card p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div className="bg-gray-800 w-full aspect-square rounded-lg mb-3 flex items-center justify-center">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="text-sm font-medium">{game}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Создать новое событие</h2>
        <div className="card p-6">
          <p className="text-gray-300 mb-4">
            Хотите организовать игровую сессию? Создайте новое событие и пригласите друзей!
          </p>
          <Link href="/games/new">
            <button className="btn-primary w-full">Создать событие</button>
          </Link>
        </div>
      </section>
    </div>
  );
} 
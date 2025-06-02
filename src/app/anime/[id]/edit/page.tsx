"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Notification from '../../../components/Notification';
import { use } from 'react';

interface AnimeFormData {
  title: string;
  year: number;
  rating: number;
  image: string;
  image_url?: string;
  genres: string[];
  review?: string;
}

export default function EditAnime({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const animeId = resolvedParams.id;
  
  const router = useRouter();
  const [formData, setFormData] = useState<AnimeFormData>({
    title: '',
    year: new Date().getFullYear(),
    rating: 8,
    image: '🎬',
    genres: [],
    review: ''
  });

  const [customGenre, setCustomGenre] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Доступные жанры
  const availableGenres = [
    'Комедия', 'Боевик', 'Драма', 'Фэнтези', 'Романтика', 
    'Мистика', 'Приключения', 'Исекай', 'Сёнен', 'Сэйнэн', 
    'Сёдзё', 'Повседневность', 'Спорт', 'Меха', 'Научная фантастика',
    'Ужасы', 'Психологическое', 'Детектив'
  ];

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        setLoading(true);
        
        // Получаем данные аниме для редактирования
        const response = await fetch(`/api/anime/${animeId}`);
        
        if (response.status === 404) {
          setError('Аниме не найдено');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные об аниме');
        }
        
        const animeData = await response.json();
        
        // Получаем текущего пользователя
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        
        // Проверяем, имеет ли пользователь право редактировать это аниме
        if (!userData.user || userData.user.id !== animeData.user_id) {
          setUnauthorized(true);
          return;
        }
        
        setFormData({
          title: animeData.title,
          year: animeData.year,
          rating: animeData.rating,
          image: animeData.image,
          image_url: animeData.image_url,
          genres: animeData.genres,
          review: animeData.review || ''
        });
        
      } catch (err) {
        console.error('Ошибка при загрузке данных аниме:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimeDetails();
  }, [animeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGenreToggle = (genre: string) => {
    if (formData.genres.includes(genre)) {
      setFormData({
        ...formData,
        genres: formData.genres.filter(g => g !== genre)
      });
    } else {
      setFormData({
        ...formData,
        genres: [...formData.genres, genre]
      });
    }
  };

  const addCustomGenre = () => {
    if (customGenre.trim() && !formData.genres.includes(customGenre.trim())) {
      setFormData({
        ...formData,
        genres: [...formData.genres, customGenre.trim()]
      });
      setCustomGenre('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (formData.genres.length === 0) {
      setNotification({
        message: 'Выберите хотя бы один жанр',
        type: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/anime/${animeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении аниме');
      }
      
      setNotification({
        message: 'Аниме успешно обновлено',
        type: 'success'
      });
      
      setTimeout(() => {
        router.push(`/anime/${animeId}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Ошибка при обновлении аниме:', err);
      setNotification({
        message: err.message || 'Не удалось обновить аниме',
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
          <p className="text-gray-400">Получаем информацию об аниме</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-6">
          <p className="text-xl text-red-500 mb-2">Доступ запрещен</p>
          <p className="text-gray-400">У вас нет прав на редактирование этого аниме</p>
        </div>
        <Link href={`/anime/${animeId}`}>
          <button className="btn-primary">Вернуться к просмотру аниме</button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-6">
          <p className="text-xl text-red-500 mb-2">{error}</p>
          <p className="text-gray-400">Не удалось загрузить информацию об аниме</p>
        </div>
        <Link href="/anime">
          <button className="btn-primary">Вернуться к списку аниме</button>
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
        <Link href={`/anime/${animeId}`} className="mr-4">
          <button className="btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
        </Link>
        <h1 className="text-3xl font-bold accent-glow">Редактирование аниме</h1>
      </div>
      
      <div className="card p-8 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="title">
                Название аниме *
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
                <label className="block text-gray-300 mb-2" htmlFor="year">
                  Год выпуска *
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  min="1960"
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="rating">
                  Оценка (1-10) *
                </label>
                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="image">
                  Эмодзи для аниме *
                </label>
                <input
                  id="image"
                  name="image"
                  type="text"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  maxLength={2}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-sm text-gray-400 mt-1">Например: 🎬, 🍿, 🎭</p>
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
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">
                Жанры *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {availableGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.genres.includes(genre)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Другой жанр"
                  className="flex-grow px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addCustomGenre}
                  className="btn"
                >
                  Добавить
                </button>
              </div>
              
              {formData.genres.length > 0 && (
                <div className="mt-3">
                  <p className="text-gray-300 mb-2">Выбранные жанры:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.genres.map((genre) => (
                      <span key={genre} className="px-3 py-1 bg-blue-600/50 rounded-full text-sm flex items-center">
                        {genre}
                        <button
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className="ml-2"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="review">
                Почему стоит посмотреть (необязательно)
              </label>
              <textarea
                id="review"
                name="review"
                value={formData.review || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link href={`/anime/${animeId}`}>
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
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Anime {
  id: number;
  title: string;
  image: string;
  image_url?: string;
  rating: number;
  year: number;
  genres: string[];
  recommended_by: string;
}

// Список возможных жанров
const genres = ['Экшен', 'Драма', 'Фэнтези', 'Комедия', 'Романтика', 'Психологическое', 'Триллер', 'Ужасы', 'Спорт', 'Приключения', 'Сверхъестественное', 'Супергерои'];

export default function Anime() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // Загрузка списка аниме при монтировании компонента
  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await fetch('/api/anime');
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных');
        }
        
        const data = await response.json();
        setAnimeList(data);
      } catch (err) {
        console.error('Ошибка при загрузке аниме:', err);
        setError('Не удалось загрузить список аниме. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnime();
  }, []);

  const handleImageError = (animeId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [animeId]: true
    }));
  };

  // Функция для отображения рейтинга звездами
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">★</span>);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-600">★</span>);
    }
    
    return stars;
  };

  return (
    <div className="flex flex-col">
      <section className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold accent-glow">Рекомендации Аниме</h1>
          <Link href="/anime/new">
            <button className="btn-primary">Рекомендовать аниме</button>
          </Link>
        </div>
        <p className="text-gray-300 mb-8">
          Делитесь своими любимыми аниме с друзьями, находите новые тайтлы для просмотра и обсуждайте их!
        </p>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Рекомендованные аниме</h2>
          <div className="flex space-x-2">
            <button className="btn">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
              </svg>
              <span className="ml-2">Сортировать</span>
            </button>
            <button className="btn">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              <span className="ml-2">Фильтр</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-xl">Загрузка...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : animeList.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl mb-4">Пока никто не добавил рекомендации аниме</p>
            <Link href="/anime/new">
              <button className="btn-primary">Добавить первую рекомендацию</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {animeList.map((anime) => (
              <Link href={`/anime/${anime.id}`} key={anime.id}>
                <div className="card p-6 h-full cursor-pointer transition-transform hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-4xl mr-3">
                        {anime.image_url && !imageErrors[anime.id] ? (
                          <img 
                            src={anime.image_url} 
                            alt={anime.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={() => handleImageError(anime.id)}
                          />
                        ) : (
                          <span className="text-3xl">{anime.image}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{anime.title}</h3>
                        <p className="text-sm text-gray-400">{anime.year}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {renderStars(anime.rating)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {anime.genres.map((genre, index) => (
                        <span key={index} className="text-xs bg-gray-800 px-2 py-1 rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400 mt-auto">
                    Рекомендовано: <span className="text-gray-300">{anime.recommended_by}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres.map((genre, index) => (
            <div key={index} className="card p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-md font-medium">{genre}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Порекомендовать аниме</h2>
        <div className="card p-6">
          <p className="text-gray-300 mb-4">
            Смотрели хорошее аниме и хотите поделиться с друзьями? Расскажите о нем и оставьте свою рекомендацию!
          </p>
          <Link href="/anime/new">
            <button className="btn-primary w-full">Добавить рекомендацию</button>
          </Link>
        </div>
      </section>
    </div>
  );
} 
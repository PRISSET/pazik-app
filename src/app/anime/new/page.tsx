"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Notification from '../../components/Notification';

// Список эмодзи для выбора в качестве картинки аниме
const emojiOptions = [
  '🏯', '⚔️', '📓', '👊', '🦸', '👹', '🐉', '🎭', '🧙', '🦊', 
  '🤖', '👾', '🚀', '🌟', '🔮', '💥', '🧠', '👻', '🌸', '🏆'
];

const genres = [
  'Экшен', 'Драма', 'Фэнтези', 'Комедия', 'Романтика', 
  'Психологическое', 'Триллер', 'Ужасы', 'Спорт', 'Приключения',
  'Повседневность', 'Научная фантастика', 'Музыкальное', 'Меха',
  'Исторический', 'Детектив', 'Сверхъестественное', 'Слайс-оф-лайф'
];

export default function NewAnimeRecommendation() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [year, setYear] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [episodes, setEpisodes] = useState('');
  const [review, setReview] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [useCustomImage, setUseCustomImage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleRatingHover = (value: number) => {
    setHoverRating(value);
  };

  const handleRatingLeave = () => {
    setHoverRating(null);
  };

  const handleImageToggle = () => {
    setUseCustomImage(!useCustomImage);
    if (useCustomImage) {
      setSelectedEmoji('');
    } else {
      setImageUrl('');
    }
  };

  const validateImageUrl = (url: string) => {
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
    if (!title || !year || selectedGenres.length === 0 || !rating) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!useCustomImage && !selectedEmoji) {
      setError('Пожалуйста, выберите эмодзи для изображения');
      return;
    }

    if (useCustomImage && !imageUrl) {
      setError('Пожалуйста, введите URL изображения');
      return;
    }

    if (useCustomImage && !validateImageUrl(imageUrl)) {
      setError('Пожалуйста, введите корректный URL изображения');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Формируем данные для отправки
      const animeData = {
        title,
        image: useCustomImage ? '🖼️' : selectedEmoji,
        image_url: useCustomImage ? imageUrl : null,
        rating,
        year: parseInt(year),
        genres: selectedGenres,
        review
      };
      
      // Отправляем запрос к API
      const response = await fetch('/api/anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animeData),
      });
      
      // Обрабатываем ответ
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при добавлении аниме');
      }
      
      // Показываем уведомление об успешном добавлении
      showNotification('Аниме успешно добавлено', 'success');
      
      // Если всё хорошо, перенаправляем на страницу аниме через 1.5 секунды
      setTimeout(() => {
        router.push('/anime');
        router.refresh();
      }, 1500);
      
    } catch (err: any) {
      console.error('Ошибка при добавлении аниме:', err);
      setError(err.message || 'Не удалось добавить аниме. Попробуйте позже.');
      showNotification('Ошибка при добавлении аниме', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отображение звезд рейтинга
  const renderRatingStars = () => {
    const stars = [];
    const activeRating = hoverRating !== null ? hoverRating : rating;
    
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-2xl ${i <= activeRating ? 'text-yellow-400' : 'text-gray-600'}`}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={handleRatingLeave}
        >
          ★
        </button>
      );
    }
    
    return stars;
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
        <Link href="/anime" className="mr-4">
          <button className="btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
        </Link>
        <h1 className="text-3xl font-bold accent-glow">Добавить рекомендацию аниме</h1>
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
              Название аниме *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Например: Attack on Titan"
            />
          </div>
          
          <div>
            <label htmlFor="originalTitle" className="block text-sm font-medium text-gray-300 mb-2">
              Оригинальное название (необязательно)
            </label>
            <input
              type="text"
              id="originalTitle"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Например: 進撃の巨人 (Shingeki no Kyojin)"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Изображение *
              </label>
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-300">Использовать URL:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={useCustomImage}
                    onChange={handleImageToggle}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            {useCustomImage ? (
              <div>
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
            ) : (
              <div>
                <div className="flex flex-wrap gap-3 mb-3">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-10 h-10 flex items-center justify-center text-2xl rounded-md ${
                        selectedEmoji === emoji
                          ? 'bg-blue-700 text-white'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {selectedEmoji && (
                  <div className="mt-2 text-gray-300">
                    Выбрано: <span className="text-2xl">{selectedEmoji}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                Год выпуска *
              </label>
              <input
                type="number"
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                min="1960"
                max={new Date().getFullYear()}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: 2013"
              />
            </div>
            
            <div>
              <label htmlFor="episodes" className="block text-sm font-medium text-gray-300 mb-2">
                Количество эпизодов (необязательно)
              </label>
              <input
                type="number"
                id="episodes"
                value={episodes}
                onChange={(e) => setEpisodes(e.target.value)}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: 25"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Жанры *
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedGenres.includes(genre)
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Выбрано: {selectedGenres.length} жанров
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Рейтинг *
            </label>
            <div className="flex items-center mb-2">
              <div className="flex">
                {renderRatingStars()}
              </div>
              <span className="ml-3 text-gray-300">
                {hoverRating !== null ? hoverRating : rating}/10
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-300 mb-2">
              Почему рекомендуешь? (необязательно)
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Расскажи, почему это аниме стоит посмотреть, что в нём особенного?"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link href="/anime">
              <button type="button" className="btn">
                Отмена
              </button>
            </Link>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Добавление...' : 'Добавить рекомендацию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
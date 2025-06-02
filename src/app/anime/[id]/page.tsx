"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Notification from '../../components/Notification';
import ConfirmDialog from '../../components/ConfirmDialog';
import { use } from 'react';

interface AnimeDetails {
  id: number;
  title: string;
  image: string;
  image_url?: string;
  rating: number;
  year: number;
  genres: string[];
  recommended_by: string;
  user_id: number;
  review?: string;
  created_at: string;
}

export default function AnimeDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const animeId = resolvedParams.id;
  
  const router = useRouter();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setCurrentUserId(data.user.id);
          }
        }
      } catch (err) {
        console.error('Ошибка при получении данных пользователя:', err);
      }
    };

    const fetchAnimeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/anime/${animeId}`);
        
        if (response.status === 404) {
          setError('Аниме не найдено');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные об аниме');
        }
        
        const data = await response.json();
        setAnime(data);
      } catch (err) {
        console.error('Ошибка при загрузке данных аниме:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
    fetchAnimeDetails();
  }, [animeId]);

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
    
    const remainingStars = 10 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-600">★</span>);
    }
    
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const canDelete = currentUserId && anime && anime.user_id === currentUserId;
  const canEdit = currentUserId && anime && anime.user_id === currentUserId;

  const openDeleteConfirmation = () => {
    setShowConfirmDialog(true);
  };

  const closeDeleteConfirmation = () => {
    setShowConfirmDialog(false);
  };

  const handleDelete = async () => {
    if (!anime) return;
    
    try {
      setIsDeleting(true);
      closeDeleteConfirmation();
      
      const response = await fetch(`/api/anime/${anime.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении аниме');
      }
      
      setNotification({
        message: 'Аниме успешно удалено',
        type: 'success'
      });
      
      setTimeout(() => {
        router.push('/anime');
        router.refresh();
      }, 1500);
      
    } catch (err: any) {
      console.error('Ошибка при удалении аниме:', err);
      setNotification({
        message: err.message || 'Не удалось удалить аниме',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
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

  if (error || !anime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-6">
          <p className="text-xl text-red-500 mb-2">{error || 'Произошла ошибка'}</p>
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Удаление рекомендации"
        message={`Вы уверены, что хотите удалить "${anime?.title}"? Это действие нельзя будет отменить.`}
        confirmText="Да, удалить"
        cancelText="Отмена"
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirmation}
        type="danger"
      />
      
      <div className="flex items-center mb-8">
        <Link href="/anime" className="mr-4">
          <button className="btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
        </Link>
        <h1 className="text-3xl font-bold accent-glow">{anime.title}</h1>
      </div>
      
      <div className="card p-8 mb-6">
        <div className="flex flex-col md:flex-row mb-6">
          <div className="flex-shrink-0 text-8xl mb-4 md:mb-0 md:mr-6 flex items-center justify-center">
            {anime.image_url && !imageError ? (
              <img 
                src={anime.image_url} 
                alt={anime.title} 
                className="max-w-full max-h-[200px] object-contain rounded-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-8xl">{anime.image}</span>
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-semibold">{anime.title}</h2>
                <p className="text-gray-400 text-sm">Год выпуска: {anime.year}</p>
              </div>
              <div className="flex">
                {renderStars(anime.rating)}
                <span className="ml-2 text-yellow-400">{anime.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-1">Рекомендовано:</p>
              <p className="text-white">{anime.recommended_by}</p>
              <p className="text-gray-400 text-sm mt-2">Добавлено: {formatDate(anime.created_at)}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Жанры</h3>
          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre, index) => (
              <span key={index} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>
        
        {anime.review && (
          <div>
            <h3 className="text-lg font-medium mb-2">Почему стоит посмотреть</h3>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-300 italic">"{anime.review}"</p>
              <p className="text-right text-gray-400 mt-2">— {anime.recommended_by}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-center space-x-4 my-6">
        <Link href="/anime">
          <button className="btn min-w-[150px] whitespace-nowrap">
            Вернуться к списку
          </button>
        </Link>
        {canDelete && (
          <button 
            onClick={openDeleteConfirmation} 
            className="btn bg-red-900/50 hover:bg-red-900/80 border-red-800/50 hover:border-red-800 text-white min-w-[150px] whitespace-nowrap"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить аниме'}
          </button>
        )}
        {canEdit && (
          <Link href={`/anime/${anime.id}/edit`}>
            <button className="btn bg-blue-900/50 hover:bg-blue-900/80 border-blue-800/50 hover:border-blue-800 text-white min-w-[150px] whitespace-nowrap">
              Редактировать
            </button>
          </Link>
        )}
        <Link href="/anime/new">
          <button className="btn-primary min-w-[150px] whitespace-nowrap">
            Добавить свою рекомендацию
          </button>
        </Link>
      </div>
    </div>
  );
} 
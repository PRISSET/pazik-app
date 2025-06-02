"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Notification from '../../components/Notification';
import ConfirmDialog from '../../components/ConfirmDialog';

interface GameEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  game: string;
  image_url?: string;
  description?: string;
  created_by: string;
  created_at: string;
  user_id: number;
  votes: {
    yes: string[];
    no: string[];
  };
}

export default function GameDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;
  
  const router = useRouter();
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${gameId}`);
        
        if (response.status === 404) {
          setError('Игровое событие не найдено');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные о событии');
        }
        
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Ошибка при загрузке данных события:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
    fetchEventDetails();
  }, [gameId]);

  const handleVote = async (voteType: boolean) => {
    if (!event) return;
    
    try {
      setVoteSubmitting(true);
      
      const response = await fetch('/api/games/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          vote: voteType
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при голосовании');
      }
      
      // Обновляем данные после успешного голосования
      const updatedResponse = await fetch(`/api/games/${gameId}`);
      const updatedData = await updatedResponse.json();
      setEvent(updatedData);
      
      setNotification({
        message: `Вы успешно проголосовали ${voteType ? 'за' : 'против'} участие в событии`,
        type: 'success'
      });
      
    } catch (err: any) {
      console.error('Ошибка при голосовании:', err);
      setNotification({
        message: err.message || 'Не удалось проголосовать. Возможно, вы не авторизованы.',
        type: 'error'
      });
    } finally {
      setVoteSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const canDelete = currentUserId && event && event.user_id === currentUserId;
  const canEdit = currentUserId && event && event.user_id === currentUserId;

  const openDeleteConfirmation = () => {
    setShowConfirmDialog(true);
  };

  const closeDeleteConfirmation = () => {
    setShowConfirmDialog(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    
    try {
      setIsDeleting(true);
      closeDeleteConfirmation();
      
      const response = await fetch(`/api/games/${event.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении события');
      }
      
      setNotification({
        message: 'Игровое событие успешно удалено',
        type: 'success'
      });
      
      setTimeout(() => {
        router.push('/games');
        router.refresh();
      }, 1500);
      
    } catch (err: any) {
      console.error('Ошибка при удалении события:', err);
      setNotification({
        message: err.message || 'Не удалось удалить событие',
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
          <p className="text-gray-400">Получаем информацию о событии</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-6">
          <p className="text-xl text-red-500 mb-2">{error || 'Произошла ошибка'}</p>
          <p className="text-gray-400">Не удалось загрузить информацию о событии</p>
        </div>
        <Link href="/games">
          <button className="btn-primary">Вернуться к списку событий</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Удаление игрового события"
        message={`Вы уверены, что хотите удалить "${event?.title}"? Это действие нельзя будет отменить.`}
        confirmText="Да, удалить"
        cancelText="Отмена"
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirmation}
        type="danger"
      />
      
      <div className="flex items-center mb-8">
        <Link href="/games" className="mr-4">
          <button className="btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
        </Link>
        <h1 className="text-3xl font-bold accent-glow">{event.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card p-6 mb-6">
            {event.image_url && !imageError && (
              <div className="mb-4">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <div className="flex items-center text-gray-400 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{formatDate(event.date)}, {event.time}</span>
                </div>
              </div>
              <span className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                {event.game}
              </span>
            </div>
            
            {event.description && (
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Описание:</h3>
                <p className="text-gray-300">{event.description}</p>
              </div>
            )}
            
            <div className="border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-400">
                Организатор: <span className="text-white">{event.created_by}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Создано: <span className="text-white">{formatDate(event.created_at)}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Голосование</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Участники</span>
                <span>{event.votes.yes.length} из {event.votes.yes.length + event.votes.no.length} за</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${(event.votes.yes.length / (event.votes.yes.length + event.votes.no.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex gap-3 mb-6">
                <button 
                  className="btn-primary flex-1 whitespace-nowrap"
                  onClick={() => handleVote(true)}
                  disabled={voteSubmitting}
                >
                  {voteSubmitting ? 'Загрузка...' : 'За'}
                </button>
                <button 
                  className="btn flex-1 whitespace-nowrap"
                  onClick={() => handleVote(false)}
                  disabled={voteSubmitting}
                >
                  {voteSubmitting ? 'Загрузка...' : 'Против'}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Участники ({event.votes.yes.length}):</h3>
              {event.votes.yes.length > 0 ? (
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {event.votes.yes.map((user, index) => (
                    <li key={index}>{user}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Пока никто не присоединился</p>
              )}
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Не придут ({event.votes.no.length}):</h2>
            {event.votes.no.length > 0 ? (
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {event.votes.no.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Пока никто не отказался</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-row justify-center space-x-4 my-6">
        <Link href="/games">
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
            {isDeleting ? 'Удаление...' : 'Удалить событие'}
          </button>
        )}
        {canEdit && (
          <Link href={`/games/${event.id}/edit`}>
            <button className="btn bg-blue-900/50 hover:bg-blue-900/80 border-blue-800/50 hover:border-blue-800 text-white min-w-[150px] whitespace-nowrap">
              Редактировать
            </button>
          </Link>
        )}
        <Link href="/games/new">
          <button className="btn-primary min-w-[150px] whitespace-nowrap">
            Создать своё событие
          </button>
        </Link>
      </div>
    </div>
  );
} 
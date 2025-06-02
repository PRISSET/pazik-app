'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
}

export default function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>;
  }

  if (!user) {
    return (
      <a href="/auth" className="btn-primary">
        Войти
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 hover:text-purple-300 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span>{user.username}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
          <div className="p-3 border-b border-gray-700">
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <ul>
            <li>
              <a
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-700 transition-all"
              >
                Профиль
              </a>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-all"
              >
                Выйти
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
} 
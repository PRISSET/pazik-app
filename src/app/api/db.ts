import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// Создаем директорию для базы данных, если она не существует
const dbDir = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Инициализируем подключение к SQLite
const dbPath = path.join(dbDir, 'pazik.db');
const db = new Database(dbPath);

// Функция для выполнения SQL-запроса
export async function query(sql: string, params: any[] = []) {
  try {
    // Для SELECT запросов
    if (sql.trim().toLowerCase().startsWith('select')) {
      const stmt = db.prepare(sql);
      return stmt.all(...params);
    }
    
    // Для INSERT, UPDATE, DELETE запросов
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return result;
  } catch (error) {
    console.error('Ошибка при выполнении SQL-запроса:', error);
    throw error;
  }
}

// Инициализация базы данных
export async function initDatabase() {
  try {
    // Сначала удалим существующие таблицы, чтобы обновить схему
    try {
      db.exec(`DROP TABLE IF EXISTS game_votes`);
      db.exec(`DROP TABLE IF EXISTS game_events`);
      db.exec(`DROP TABLE IF EXISTS anime_genres`);
      db.exec(`DROP TABLE IF EXISTS anime`);
      console.log('Существующие таблицы удалены');
    } catch (error) {
      console.error('Ошибка при удалении таблиц:', error);
    }
    
    // Создаем таблицу пользователей, если она не существует
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаем таблицу аниме
    db.exec(`
      CREATE TABLE IF NOT EXISTS anime (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        image_url TEXT,
        rating REAL NOT NULL,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL,
        review TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Создаем таблицу жанров аниме
    db.exec(`
      CREATE TABLE IF NOT EXISTS anime_genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anime_id INTEGER NOT NULL,
        genre TEXT NOT NULL,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
      )
    `);

    // Создаем таблицу игровых событий
    db.exec(`
      CREATE TABLE IF NOT EXISTS game_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        game TEXT NOT NULL,
        image_url TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Создаем таблицу голосов для игровых событий
    db.exec(`
      CREATE TABLE IF NOT EXISTS game_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        vote INTEGER NOT NULL, -- 1 за, 0 против
        FOREIGN KEY (event_id) REFERENCES game_events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('База данных SQLite инициализирована успешно');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  }
}

// Функция для получения соединения (для совместимости с предыдущим кодом)
export async function getConnection() {
  return db;
}

export default { query, getConnection, initDatabase }; 
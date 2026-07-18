import Database from 'better-sqlite3';
import 'dotenv/config';

export const db = new Database(process.env.DB_PATH || './data.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    route TEXT NOT NULL,
    cargo_details TEXT,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const count = db.prepare('SELECT COUNT(*) AS c FROM services').get().c;
if (count === 0) {
  const insert = db.prepare('INSERT INTO services (title, description) VALUES (?, ?)');
  insert.run('Диспетчерство', 'Подбор груза и водителя, сопровождение перевозки на маршрутах СНГ');
  insert.run('Растаможка', 'Оформление таможенных процедур для международных грузоперевозок');
  insert.run('Денежные переводы', 'Безопасные переводы в любую валюту и точку мира, финансовая поддержка водителям');
}

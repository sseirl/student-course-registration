const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
    } else {
        console.log('Подключено к SQLite');
        createTables();
    }
});

const createTables = () => {
    // Таблица пользователей
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // После создания таблицы users, добавляем колонки профиля
// Добавляем поля профиля (факультет, группа, курс, телефон)
db.all(`PRAGMA table_info(users)`, [], (err, rows) => {
    if (err) {
        console.error('Ошибка получения информации о таблице users:', err);
        return;
    }
    const columnNames = rows.map(row => row.name);
    if (!columnNames.includes('faculty')) {
        db.run('ALTER TABLE users ADD COLUMN faculty TEXT');
        console.log('✅ Добавлена колонка faculty');
    }
    if (!columnNames.includes('group_name')) {
        db.run('ALTER TABLE users ADD COLUMN group_name TEXT');
        console.log('✅ Добавлена колонка group_name');
    }
    if (!columnNames.includes('year_of_study')) {
        db.run('ALTER TABLE users ADD COLUMN year_of_study INTEGER');
        console.log('✅ Добавлена колонка year_of_study');
    }
    if (!columnNames.includes('phone')) {
        db.run('ALTER TABLE users ADD COLUMN phone TEXT');
        console.log('✅ Добавлена колонка phone');
    }
});

    // Таблица курсов
    db.run(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            credits INTEGER DEFAULT 3,
            max_capacity INTEGER DEFAULT 30,
            current_enrolled INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Таблица записей
    db.run(`
        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            approved_at DATETIME,
            approved_by INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            UNIQUE(user_id, course_id)
        )
    `);

    // Таблица преподавателей
    db.run(`
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            bio TEXT,
            email TEXT UNIQUE,
            avatar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Связь курсов с преподавателями
    db.run(`
        CREATE TABLE IF NOT EXISTS course_teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            teacher_id INTEGER NOT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
            UNIQUE(course_id, teacher_id)
        )
    `);

    // Добавляем поле teacher_id в enrollments (упрощённый способ)
    db.get("PRAGMA table_info(enrollments)", (err, row) => {
        // Просто пытаемся добавить колонку, если ошибка — значит уже есть
        db.run(`ALTER TABLE enrollments ADD COLUMN teacher_id INTEGER REFERENCES teachers(id)`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.log('⚠️ Колонка teacher_id уже существует или ошибка:', err.message);
            } else if (!err) {
                console.log('✅ Добавлена колонка teacher_id в enrollments');
            }
        });
    });

    console.log('Таблицы проверены/созданы');
};

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

module.exports = { query, run, db };
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Регистрация
const register = async (req, res) => {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    try {
        // Проверяем, есть ли пользователь
        const existing = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создаём пользователя
        const result = await db.run(
            `INSERT INTO users (email, password_hash, full_name, role) 
             VALUES (?, ?, ?, 'user')`,
            [email, hashedPassword, full_name]
        );

        const token = jwt.sign(
            { id: result.lastID, email: email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: {
                id: result.lastID,
                email: email,
                full_name: full_name,
                role: 'user'
            }
        });

    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Логин
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Введите email и пароль' });
    }

    try {
        const users = await db.query(
            'SELECT id, email, password_hash, full_name, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Вход выполнен',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = { register, login };
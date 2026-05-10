const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

// Получить свой профиль (для любого авторизованного)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await db.query(
            'SELECT id, email, full_name, role, faculty, group_name, year_of_study, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        if (user.length === 0) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json(user[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Обновить свой профиль
router.put('/me', auth, async (req, res) => {
    const { full_name, faculty, group_name, year_of_study, phone } = req.body;
    try {
        await db.run(
            `UPDATE users SET 
                full_name = COALESCE(?, full_name),
                faculty = ?,
                group_name = ?,
                year_of_study = ?,
                phone = ?
             WHERE id = ?`,
            [full_name, faculty, group_name, year_of_study, phone, req.user.id]
        );
        res.json({ message: 'Профиль обновлён' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка обновления' });
    }
});

// Получить всех пользователей (только админ)
router.get('/', auth, allowRoles('admin'), async (req, res) => {
    try {
        const users = await db.query('SELECT id, email, full_name, role, created_at, faculty, group_name, year_of_study, phone FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка загрузки пользователей' });
    }
});

// Изменить роль пользователя (только админ)
router.patch('/:id/role', auth, allowRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'manager', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Недопустимая роль' });
    }

    try {
        await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Роль обновлена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка обновления роли' });
    }
});

module.exports = router;
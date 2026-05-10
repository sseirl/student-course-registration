const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

// Получить всех преподавателей
router.get('/', async (req, res) => {
    try {
        const teachers = await db.query('SELECT * FROM teachers ORDER BY full_name');
        res.json(teachers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка загрузки преподавателей' });
    }
});

// Получить преподавателей курса
router.get('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const teachers = await db.query(
            `SELECT t.* FROM teachers t
             JOIN course_teachers ct ON ct.teacher_id = t.id
             WHERE ct.course_id = ?`,
            [courseId]
        );
        res.json(teachers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка загрузки преподавателей курса' });
    }
});

// Добавить преподавателя (только админ)
router.post('/', auth, allowRoles('admin'), async (req, res) => {
    const { full_name, bio, email } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO teachers (full_name, bio, email) VALUES (?, ?, ?)`,
            [full_name, bio, email]
        );
        const newTeacher = await db.query('SELECT * FROM teachers WHERE id = ?', [result.lastID]);
        res.status(201).json(newTeacher[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка добавления преподавателя' });
    }
});

// Привязать преподавателя к курсу (только админ)
router.post('/attach', auth, allowRoles('admin'), async (req, res) => {
    const { course_id, teacher_id } = req.body;
    try {
        await db.run(
            `INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)`,
            [course_id, teacher_id]
        );
        res.json({ message: 'Преподаватель привязан к курсу' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка привязки преподавателя' });
    }
});

module.exports = router;
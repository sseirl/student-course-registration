const db = require('../config/db');

// Получить все курсы (с поиском и фильтрацией)
const getAllCourses = async (req, res) => {
    const { search, category, status } = req.query;
    
    let sql = 'SELECT * FROM courses WHERE 1=1';
    const params = [];

    // Обработка статуса
    if (status && status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
    }
    // Если status = 'all' или не указан — показываем все курсы

    if (category) {
        sql += ' AND category = ?';
        params.push(category);
    }

    if (search) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    try {
        const courses = await db.query(sql, params);
        res.json(courses);
    } catch (err) {
        console.error('Ошибка получения курсов:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получить один курс
const getCourseById = async (req, res) => {
    const { id } = req.params;

    try {
        const courses = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        
        if (courses.length === 0) {
            return res.status(404).json({ message: 'Курс не найден' });
        }

        res.json(courses[0]);
    } catch (err) {
        console.error('Ошибка получения курса:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Создать курс (только админ)
const createCourse = async (req, res) => {
    const { title, description, category, credits, max_capacity } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Название курса обязательно' });
    }

    try {
        const result = await db.run(
            `INSERT INTO courses (title, description, category, credits, max_capacity, current_enrolled, status) 
             VALUES (?, ?, ?, ?, ?, 0, 'active')`,
            [title, description || '', category || 'General', credits || 3, max_capacity || 30]
        );

        const newCourse = await db.query('SELECT * FROM courses WHERE id = ?', [result.lastID]);
        res.status(201).json(newCourse[0]);
    } catch (err) {
        console.error('Ошибка создания курса:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Обновить курс (только админ)
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, category, credits, max_capacity, status } = req.body;

    try {
        const existing = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Курс не найден' });
        }

        await db.run(
            `UPDATE courses 
             SET title = COALESCE(?, title), 
                 description = COALESCE(?, description), 
                 category = COALESCE(?, category), 
                 credits = COALESCE(?, credits), 
                 max_capacity = COALESCE(?, max_capacity),
                 status = COALESCE(?, status)
             WHERE id = ?`,
            [title, description, category, credits, max_capacity, status, id]
        );

        const updated = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (err) {
        console.error('Ошибка обновления курса:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Удалить курс (только админ)
const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const existing = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Курс не найден' });
        }

        await db.run('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ message: 'Курс удалён' });
    } catch (err) {
        console.error('Ошибка удаления курса:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Привязать преподавателей к курсу
const attachTeachers = async (req, res) => {
    const { course_id, teacher_ids } = req.body;

    if (!course_id || !Array.isArray(teacher_ids)) {
        return res.status(400).json({ message: 'Некорректные данные' });
    }

    try {
        // Проверяем, существует ли курс
        const course = await db.query('SELECT id FROM courses WHERE id = ?', [course_id]);
        if (course.length === 0) {
            return res.status(404).json({ message: 'Курс не найден' });
        }

        // Удаляем старые связи
        await db.run('DELETE FROM course_teachers WHERE course_id = ?', [course_id]);

        // Добавляем новые связи
        for (const teacher_id of teacher_ids) {
            // Проверяем, существует ли преподаватель
            const teacher = await db.query('SELECT id FROM teachers WHERE id = ?', [teacher_id]);
            if (teacher.length > 0) {
                await db.run(
                    'INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)',
                    [course_id, teacher_id]
                );
            }
        }

        res.json({ message: 'Преподаватели успешно привязаны к курсу' });
    } catch (err) {
        console.error('Ошибка привязки преподавателей:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    attachTeachers
};
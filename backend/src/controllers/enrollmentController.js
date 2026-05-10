const db = require('../config/db');

// Записаться на курс
// enrollCourse - обновлённая версия
const enrollCourse = async (req, res) => {
    const { course_id, teacher_id } = req.body;
    const user_id = req.user.id;

    if (!course_id) {
        return res.status(400).json({ message: 'ID курса обязателен' });
    }
    
    if (!teacher_id) {
        return res.status(400).json({ message: 'Выберите преподавателя' });
    }

    try {
        const course = await db.query('SELECT * FROM courses WHERE id = ? AND status = "active"', [course_id]);
        if (course.length === 0) {
            return res.status(404).json({ message: 'Курс не найден или не активен' });
        }

        const existing = await db.query(
            'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
            [user_id, course_id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Вы уже записаны на этот курс' });
        }

        // Проверяем, что преподаватель действительно ведёт этот курс
        const teacherValid = await db.query(
            'SELECT * FROM course_teachers WHERE course_id = ? AND teacher_id = ?',
            [course_id, teacher_id]
        );
        
        if (teacherValid.length === 0) {
            return res.status(400).json({ message: 'Выбранный преподаватель не ведёт этот курс' });
        }

        await db.run(
            'INSERT INTO enrollments (user_id, course_id, teacher_id, status) VALUES (?, ?, ?, "pending")',
            [user_id, course_id, teacher_id]
        );

        res.status(201).json({ message: 'Заявка отправлена на одобрение' });
        
    } catch (err) {
        console.error('Ошибка записи:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Просмотр своих записей
const getMyEnrollments = async (req, res) => {
    const user_id = req.user.id;

    try {
        const enrollments = await db.query(
            `SELECT e.*, c.title, c.description, c.credits 
             FROM enrollments e 
             JOIN courses c ON e.course_id = c.id 
             WHERE e.user_id = ? 
             ORDER BY e.requested_at DESC`,
            [user_id]
        );
        
        res.json(enrollments);
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};




// Отменить заявку (только если статус pending)
const cancelEnrollment = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const enrollment = await db.query(
            'SELECT * FROM enrollments WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        
        if (enrollment.length === 0) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }
        
        if (enrollment[0].status !== 'pending') {
            return res.status(400).json({ message: 'Можно отменить только заявку на рассмотрении' });
        }
        
        await db.run('DELETE FROM enrollments WHERE id = ?', [id]);
        res.json({ message: 'Заявка отменена' });
        
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Все pending заявки (для менеджера/админа)
const getPendingEnrollments = async (req, res) => {
    try {
        const enrollments = await db.query(
            `SELECT e.*, u.full_name, u.email, c.title 
             FROM enrollments e 
             JOIN users u ON e.user_id = u.id 
             JOIN courses c ON e.course_id = c.id 
             WHERE e.status = 'pending' 
             ORDER BY e.requested_at ASC`
        );
        
        res.json(enrollments);
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Одобрить заявку
const approveEnrollment = async (req, res) => {
    const { id } = req.params;
    const approved_by = req.user.id;

    try {
        const enrollment = await db.query(
            'SELECT * FROM enrollments WHERE id = ? AND status = "pending"',
            [id]
        );
        
        if (enrollment.length === 0) {
            return res.status(404).json({ message: 'Заявка не найдена или уже обработана' });
        }
        
        const course = await db.query(
            'SELECT * FROM courses WHERE id = ?',
            [enrollment[0].course_id]
        );
        
        // Проверяем свободные места
        if (course[0].current_enrolled >= course[0].max_capacity) {
            return res.status(400).json({ message: 'Нет свободных мест на этот курс' });
        }
        
        // Обновляем статус заявки
        await db.run(
            `UPDATE enrollments 
             SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = ? 
             WHERE id = ?`,
            [approved_by, id]
        );
        
        // Увеличиваем счётчик записанных студентов
        await db.run(
            'UPDATE courses SET current_enrolled = current_enrolled + 1 WHERE id = ?',
            [course[0].id]
        );
        
        res.json({ message: 'Заявка одобрена' });
        
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Отклонить заявку
const rejectEnrollment = async (req, res) => {
    const { id } = req.params;
    const approved_by = req.user.id;

    try {
        const enrollment = await db.query(
            'SELECT * FROM enrollments WHERE id = ? AND status = "pending"',
            [id]
        );
        
        if (enrollment.length === 0) {
            return res.status(404).json({ message: 'Заявка не найдена или уже обработана' });
        }
        
        await db.run(
            `UPDATE enrollments 
             SET status = 'rejected', approved_at = CURRENT_TIMESTAMP, approved_by = ? 
             WHERE id = ?`,
            [approved_by, id]
        );
        
        res.json({ message: 'Заявка отклонена' });
        
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = {
    enrollCourse,
    getMyEnrollments,
    cancelEnrollment,
    getPendingEnrollments,
    approveEnrollment,
    rejectEnrollment
};
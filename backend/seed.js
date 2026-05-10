const db = require('./src/config/db');

const seedCourses = async () => {
    const courses = [
        ['React Basics', 'Изучаем React с нуля', 'Programming', 3, 25, 0, 'active'],
        ['Node.js Advanced', 'Глубокое погружение в Node', 'Backend', 4, 20, 0, 'active'],
        ['UI Design Fundamentals', 'Основы интерфейсов', 'Design', 2, 15, 0, 'active'],
        ['PostgreSQL для начинающих', 'Базы данных простыми словами', 'Database', 3, 30, 0, 'active'],
        ['TypeScript в действии', 'Типизация для больших проектов', 'Programming', 3, 20, 0, 'archived']
    ];

    for (const course of courses) {
        await db.run(
            `INSERT INTO courses (title, description, category, credits, max_capacity, current_enrolled, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            course
        );
    }

    console.log('Добавлено 5 тестовых курсов');
    process.exit();
};

seedCourses();
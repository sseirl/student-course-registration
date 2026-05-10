const db = require('./src/config/db');

const seedTeachers = async () => {
    console.log('Добавляем преподавателей...');

    const teachers = [
        ['Анна Петрова', 'PhD в области компьютерных наук, 10 лет опыта в разработке', 'anna.petrova@university.com'],
        ['Иван Соколов', 'Эксперт по React и Node.js, автор книг по JavaScript', 'ivan.sokolov@university.com'],
        ['Мария Ким', 'Senior Frontend Developer, преподаватель с 8-летним стажем', 'maria.kim@university.com'],
        ['Елена Волкова', 'Эксперт по базам данных и SQL, кандидат технических наук', 'elena.volkova@university.com'],
        ['Алексей Морозов', 'Специалист по UI/UX дизайну, работал в крупных IT-компаниях', 'alexey.morozov@university.com'],
    ];

    for (const teacher of teachers) {
        try {
            await db.run(
                `INSERT INTO teachers (full_name, bio, email) VALUES (?, ?, ?)`,
                teacher
            );
            console.log(`Добавлен преподаватель: ${teacher[0]}`);
        } catch (err) {
            if (err.message.includes('UNIQUE')) {
                console.log(`Преподаватель ${teacher[0]} уже существует`);
            } else {
                console.log(`Ошибка: ${err.message}`);
            }
        }
    }

    // Проверяем результат
    const result = await db.query('SELECT * FROM teachers');
    console.log(`\n👨‍🏫 Всего преподавателей: ${result.length}`);
    console.table(result);
    
    process.exit();
};

seedTeachers();
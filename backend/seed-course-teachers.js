const db = require('./src/config/db');

const seedCourseTeachers = async () => {
    console.log('Привязываем преподавателей к курсам...');

    // Сначала получим ID всех курсов и преподавателей
    const courses = await db.query('SELECT id, title FROM courses');
    const teachers = await db.query('SELECT id, full_name FROM teachers');

    console.log('\n📚 Курсы:', courses.map(c => `${c.id}: ${c.title}`).join(', '));
    console.log('👨‍🏫 Преподаватели:', teachers.map(t => `${t.id}: ${t.full_name}`).join(', '));

    // Связи: course_id -> [teacher_ids]
    const relations = [
        { courseId: 1, teacherIds: [1, 2] },  // React Basics -> Анна Петрова, Иван Соколов
        { courseId: 2, teacherIds: [2, 3] },  // Node.js Advanced -> Иван Соколов, Мария Ким
        { courseId: 3, teacherIds: [4] },     // UI Design -> Елена Волкова
        { courseId: 4, teacherIds: [4, 5] },  // PostgreSQL -> Елена Волкова, Алексей Морозов
    ];

    for (const rel of relations) {
        for (const teacherId of rel.teacherIds) {
            try {
                await db.run(
                    `INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)`,
                    [rel.courseId, teacherId]
                );
                const teacher = teachers.find(t => t.id === teacherId);
                const course = courses.find(c => c.id === rel.courseId);
                console.log(`✅ Связан курс "${course?.title}" с преподавателем ${teacher?.full_name}`);
            } catch (err) {
                if (!err.message.includes('UNIQUE')) {
                    console.log(`⚠️ Ошибка: ${err.message}`);
                }
            }
        }
    }

    console.log('\n✅ Готово!');
    process.exit();
};

seedCourseTeachers();
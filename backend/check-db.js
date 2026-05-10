const db = require('./src/config/db');

const checkDB = async () => {
    console.log('\n=== Проверка базы данных ===\n');
    
    // Пользователи
    const users = await db.query('SELECT id, email, full_name, role FROM users');
    console.log('👥 Пользователи:', users.length);
    console.table(users);
    
    // Курсы
    const courses = await db.query('SELECT id, title, category, status FROM courses');
    console.log('\n📚 Курсы:', courses.length);
    console.table(courses);
    
    // Заявки
    const enrollments = await db.query('SELECT id, user_id, course_id, status FROM enrollments');
    console.log('\n📝 Заявки:', enrollments.length);
    console.table(enrollments);
    
    process.exit();
};

checkDB();